import * as robot from "robotjs";

function getMouseButtonByMouseEvent(n) {
  switch (n) {
    case 0:
      return "left";
    case 1:
      return "middle";
    case 2:
      return "right";
    default:
      return "left";
  }
}

function getMouseTypeByMouseEvent(type) {
  switch (type) {
    case "mouseup":
      return "up";
    case "mousedown":
      return "down";
    default:
      return "down";
  }
}

export function mouseToggle({rateX,rateY,type,button}) {
  const nowScreenSize = robot.getScreenSize()
  robot.moveMouse(nowScreenSize.width*rateX, nowScreenSize.height*rateY);
  robot.mouseToggle(getMouseTypeByMouseEvent(type),getMouseButtonByMouseEvent(button));
}

function getKeyTypeByKeyEvent(type) {
  switch (type) {
    case "keyup":
      return "up";
    case "keydown":
      return "down";
    default:
      return "down";
  }
}

function getKeyByKeyEvent(key) {
  return key.toLowerCase()
}


export function keyToggle({key,type}) {
  robot.keyToggle(getKeyByKeyEvent(key), getKeyTypeByKeyEvent(type));
}

const blockScreenMap:{[key:string]:{screenBlock:Array<Buffer>,dateTime:number}} = {}
let isRecycleBlockScreen = false
function recycleBlockScreen() {
  if(isRecycleBlockScreen) {return}
  isRecycleBlockScreen = true
  setTimeout(() => {
    for(const key of Object.keys(blockScreenMap)) {
      if(Date.now()-blockScreenMap[key].dateTime+1>1000*30) {
        delete blockScreenMap[key]
      }
    }
    isRecycleBlockScreen = false
  }, 1000*30)
}

function getScreenBlock(heightBlockNum) {
  const nowScreenData = robot.screen.capture()
    const heightBlock = nowScreenData.height / heightBlockNum
    const len = heightBlock * nowScreenData.width * nowScreenData.bytesPerPixel
    const blockList = []
    for (let i = 0; i < heightBlockNum; i++) {
      blockList.push(nowScreenData.image.subarray(i*len, i*len+len))
    }
  return {
    width:nowScreenData.width,
    height:nowScreenData.height,
    bitsPerPixel: nowScreenData.bitsPerPixel,
    bytesPerPixel: nowScreenData.bytesPerPixel,
    blockList,
    blockLen: len
  }
}

function isScreenBlockSame(firstScreenBlock, secondScreenBlock, randCheckNum) {
  if (firstScreenBlock.length !== secondScreenBlock.length) {
      return false
  }
  for (let i = 0; i < randCheckNum; i++) {
      const randIndex = Math.floor(Math.random() * firstScreenBlock.length)
      if (firstScreenBlock[randIndex] !== secondScreenBlock[randIndex]) {
          return false
      }
  }
  return true
}


function getChangeBlockList(oldScreenBlockList, newScreenBlockList, randCheckNum) {
  if (oldScreenBlockList.length !== newScreenBlockList.length) {
    return newScreenBlockList
}
  const changeBlockList = new Array(newScreenBlockList.length)
  for (let i = 0; i < newScreenBlockList.length; i++) {
      if (!isScreenBlockSame(oldScreenBlockList[i], newScreenBlockList[i], randCheckNum)) {
          changeBlockList[i] = newScreenBlockList[i]
      }
  }
  return changeBlockList
}

export function getBlockScreen({sessionId}) {
  const blockNum = 10
  const randCheckNum = 300
  if(!blockScreenMap[sessionId]) {
    blockScreenMap[sessionId] = {screenBlock:[],dateTime:Date.now()}
  }
  const nowScreenBlock = getScreenBlock(blockNum)
  const changeBlockList  = getChangeBlockList(blockScreenMap[sessionId].screenBlock, nowScreenBlock.blockList, randCheckNum)
  blockScreenMap[sessionId] = {screenBlock:nowScreenBlock.blockList,dateTime:Date.now()}
  recycleBlockScreen()
  return {
    width:nowScreenBlock.width,
    height:nowScreenBlock.height,
    bitsPerPixel: nowScreenBlock.bitsPerPixel,
    bytesPerPixel: nowScreenBlock.bytesPerPixel,
    blockNum,
    blockLen:nowScreenBlock.blockLen,
    changeBlockList
  }
}


export function getScreenSize() {
  return robot.getScreenSize();
}

export function getScreen() {
  return robot.screen.capture();
}
