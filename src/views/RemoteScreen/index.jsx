import styles from "./index.module.css";
import { useEffect, useState, useRef } from 'react';
import { InvokeWebSocketClient } from '../utils/websocket';


let ws = null
const RemoteScreen = () => {
    const canvasRef = useRef(null);
    const [screenSizeData, setScreenSizeData] = useState(null)

    const initRemoteDesktop = async () => {
        ws = new InvokeWebSocketClient()
        await ws.onopen()
        const nowScreenSizeData = await ws.invoke('getScreenSize', {})
        setScreenSizeData({
            width: nowScreenSizeData.width,
            height: nowScreenSizeData.height
        })
        return () => {
            ws.close()
        }
    }
    const drawScreen = async () => {
        if (!screenSizeData) { return }
        if (!canvasRef) { return }
        const canvas = canvasRef.current
        const nowScreenData = await ws.invoke('getScreen', {})
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(nowScreenData.width, nowScreenData.height);
        setScreenSizeData({
            width: nowScreenData.width,
            height: nowScreenData.height
        })
        const nowScreenimageData = nowScreenData.image.data;
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = nowScreenimageData[i + 2];     // Red
            imageData.data[i + 1] = nowScreenimageData[i + 1];   // Green
            imageData.data[i + 2] = nowScreenimageData[i];   // Blue
            imageData.data[i + 3] = 255; // Alpha (fully opaque)
        }
        ctx.putImageData(imageData, 0, 0);
    }

    const listenOperation = () => {
        if (!screenSizeData) { return () => { } }
        if (!canvasRef) { return () => { } }
        const canvas = canvasRef.current

        const mouseEvent = async (e) => {
            const params = { type: e.type, button: e.button, rateX: e.offsetX / canvas.offsetWidth, rateY: e.offsetY / canvas.offsetHeight }
            await ws.invoke('mouseToggle', params)
        }

        const mousedownEvent = async (e) => {
            await mouseEvent(e)
        }

        const mouseupEvent = async (e) => {
            await mouseEvent(e)
        }

        const keyEvent = async (e) => {
            const params = { type: e.type, key: e.key }
            await ws.invoke('keyToggle', params)
        }

        const keydownEvent = async (e) => {
            await keyEvent()
        }

        const keyupEvent = async (e) => {
            await keyEvent()
        }

        const contextmenuEvent = (e) => {
            e.preventDefault();
        }


        canvas.addEventListener('mousedown', mousedownEvent);

        canvas.addEventListener('mouseup', mouseupEvent);

        document.addEventListener('keydown', keydownEvent);

        document.addEventListener('keyup', keyupEvent);

        canvas.addEventListener('contextmenu', contextmenuEvent);


        return () => {
            canvas.removeEventListener('mousedown', mousedownEvent);

            canvas.removeEventListener('mouseup', mouseupEvent);

            document.removeEventListener('keydown', keydownEvent);

            document.removeEventListener('keyup', keyupEvent);

            canvas.removeEventListener('contextmenu', contextmenuEvent);
        }
    }


    useEffect(() => {
        const callback = initRemoteDesktop()
        return callback
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            drawScreen()
        }, 300)
        const removeListen = listenOperation()
        return () => {
            clearInterval(timer)
            removeListen()
        }
    }, [screenSizeData, canvasRef])

    return (
        screenSizeData && <canvas ref={canvasRef} className={styles.contain} width={screenSizeData.width} height={screenSizeData.height} />
    );
};

export default RemoteScreen;
