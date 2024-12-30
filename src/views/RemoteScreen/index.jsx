import styles from "./index.module.css";
import { useEffect, useState, useRef } from 'react';
import { InvokeWebSocketClient } from '../utils/websocket';
import { v1 as uuidv1 } from 'uuid';


let ws = null

const sessionId = uuidv1()

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const RemoteScreen = () => {
    const canvasRef = useRef(null);
    const [isInit, setIsInit] = useState(false)
    const [screenSizeData, setScreenSizeData] = useState(null)

    const initRemoteDesktop = async () => {
        ws = new InvokeWebSocketClient()
        await ws.onopen()
        const nowScreenSizeData = await ws.invoke('getScreenSize', {})
        setScreenSizeData({
            width: nowScreenSizeData.width,
            height: nowScreenSizeData.height
        })
        setIsInit(true)
        return () => {
            ws.close()
        }
    }
    const MaxWaitTime = 500

    let imageFullScreenData = null
    const drawScreen = async (waitTime = MaxWaitTime) => {
        if (!canvasRef?.current) { return }
        const canvas = canvasRef.current
        const {
            width,
            height,
            bytesPerPixel,
            image
        } = await ws.invoke('getScreen', {})
        setScreenSizeData({
            width,
            height
        })
        const ctx = canvas.getContext('2d');
        if (!imageFullScreenData) {
            imageFullScreenData = ctx.createImageData(width, height);
        }
        if (imageFullScreenData.width !== width || imageFullScreenData.height !== height) {
            imageFullScreenData = ctx.createImageData(width, height);
        }
        const nowScreenimageData = image.data;
        for (let i = 0; i < nowScreenimageData.length; i += 4) {
            imageFullScreenData.data[i] = nowScreenimageData[i + 2];     // Red
            imageFullScreenData.data[i + 1] = nowScreenimageData[i + 1];   // Green
            imageFullScreenData.data[i + 2] = nowScreenimageData[i];   // Blue
            imageFullScreenData.data[i + 3] = nowScreenimageData[i + 3]; // Alpha (fully opaque)
        }
        ctx.putImageData(imageFullScreenData, 0, 0);
        await sleep(waitTime)
        await drawScreen()
    }

    let imageScreenBlockData = null
    const drawBlockScreen = async (waitTime = MaxWaitTime) => {
        if (!canvasRef?.current) { return }
        const canvas = canvasRef.current
        const nowBlockScreenData = await ws.invoke('getBlockScreen', { sessionId })
        setScreenSizeData({
            width: nowBlockScreenData.width,
            height: nowBlockScreenData.height
        })
        const ctx = canvas.getContext('2d');
        const {
            width,
            height,
            bytesPerPixel,
            changeBlockList
        } = nowBlockScreenData
        if (!imageScreenBlockData) {
            imageScreenBlockData = ctx.createImageData(width, height);
        }
        if (imageScreenBlockData.width !== width || imageScreenBlockData.height !== height) {
            imageFullScreenData = ctx.createImageData(width, height);
        }
        for (let i = 0; i < changeBlockList.length; i++) {
            if (!changeBlockList[i]) {
                continue
            }
            const nowBlock = changeBlockList[i].data
            const blockOffset = i * nowBlock.length
            for (let j = 0; j < nowBlock.length; j += bytesPerPixel) {
                const offset = blockOffset + j
                imageScreenBlockData.data[offset] = nowBlock[j + 2];     // Red
                imageScreenBlockData.data[offset + 1] = nowBlock[j + 1];   // Green
                imageScreenBlockData.data[offset + 2] = nowBlock[j];   // Blue
                imageScreenBlockData.data[offset + 3] = nowBlock[j + 3]
            }
        }
        console.log(changeBlockList)
        ctx.putImageData(imageScreenBlockData, 0, 0);
        await sleep(waitTime)
        await drawBlockScreen()
    }

    const listenOperation = () => {
        if (!canvasRef?.current) { return () => { } }
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
        drawBlockScreen()
        // drawScreen()
        const removeListen = listenOperation()
        return () => {
            removeListen()
        }
    }, [isInit])

    return (
        isInit && <canvas ref={canvasRef} className={styles.contain} width={screenSizeData.width} height={screenSizeData.height} />
    );
};

export default RemoteScreen;
