import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setModal } from "../store/actions";
import { AppState } from "../store/state";
import musicStyle from "./musicDetail.module.css";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import MusicPlay from '../components/musicrecord/musicplay';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const Background = styled.div<{ $imageUrl: string }>`
  opacity: 1;
  position: fixed;
  width:100%;
  height:100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${(props) => props.$imageUrl});
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: start;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  color: white;
  text-align: right;
  z-index: 9999;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  top: 40px;
  right: 20px;
`;

const ModalContainer = styled.div<{ open: boolean }>`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${(props) => (props.open ? slideUp : slideDown)} 0.3s forwards;
`;

const MusicSing: React.FC = () => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector((state: AppState) => state.isModalOpen === "musicSing");
  const album = useSelector((state: AppState) => state.album);
  const [isPlay, setIsplay] = useState(false);
  const recorderControls = useAudioRecorder();
  const [isRecording, setIsRecording] = useState(false);
  const [audioSourceURL, setAudioSourceURL] = React.useState("");

  const handleStartRecording = () => {
      // 미디어 액세스 권한 확인 및 요청
      navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function (stream) {
              // 권한 승인됨, 녹음 시작
              setIsRecording(!isRecording);
              console.log(isRecording)
              console.log(audioSourceURL)
              // 녹음을 시작하는 코드 추가
              recorderControls.startRecording();
          })
          .catch(function (error) {
              // 권한 거부 또는 오류 발생
              console.error('미디어 액세스 권한 확인 실패:', error);
              // 사용자에게 오류 메시지 표시
              alert('녹음 권한을 허용해야 녹음을 시작할 수 있습니다.');
          });
  };

  const addAudio = (blob: Blob) => {
      setIsRecording(true);
      const url = URL.createObjectURL(blob);
      setAudioSourceURL(url);
      console.log(url)
  };

  const handleRestartRecording = () => {
    setAudioSourceURL("");
    setIsRecording(!isRecording);
    console.log(audioSourceURL)
    console.log(isRecording)
  };

  const recordresult = () => {
    // navigate("/recordresult");
  };

  const youtubeURL = `${album.url}`;
  const videoId = youtubeURL.split("v=")[1]?.split("&")[0];

  useEffect(()=>{
    setIsplay(false);
  },[isModalOpen])
 
  const handlePlayPause = () => {
    if (isPlay) {
      // Pause the video
      setIsplay(false);
    } else {
      // Play the video
      setIsplay(true);
      setTimeout(() => {
        const iframe = document.querySelector<HTMLIFrameElement>("#yt");
        if (iframe) {
          const a=iframe.src
          iframe.setAttribute('credentialless','true')
          iframe.src=a
        }
      }, 500);
      
      
    }
  };

  // Render the modal
  if (!isModalOpen) {
    return null;
  }
  // 여기부터 터치 이벤트 관련 start

  // 터치 이벤트 end

  return (
      <Background $imageUrl="../../assets/background.png">
        <CloseButton onClick={() => dispatch(setModal(null))}>
          닫기
        </CloseButton>
        <ModalContainer open={isModalOpen}>
          <h1>SING</h1>
          <div style={{display:'flex', justifyContent:'start', width:'90%', alignItems:'center', height:'10%', marginTop:15, padding:'0 5px', backgroundColor:'rgba(255, 255, 255, 0.2)', borderRadius:20}}>
            <img src={album.image} alt="" style={{height:'80%', borderRadius:10, marginRight:10}} />
            <div style={{textAlign:'start'}}>
              <div className={musicStyle.titleFont}>{album.title}</div>
              <div className={musicStyle.singerFont}>{album.singer}</div>
            </div>
          </div>
          
          <div style={{width:'100%', height:'250px',backgroundColor:'black', marginTop:10}}>
            {isPlay && <iframe title='yt' id='yt' width='100%' height='250' allow={'autoplay'} src={`https://yewtu.be/embed/${videoId}`} frameBorder={0} allowFullScreen style={{pointerEvents:'none'}}
             onLoad={()=>{
              //여기에 녹음시작 코드 추가해야함
              // alert('로드완료')
              handleStartRecording()
             }}
             />}
          </div>
          <div style={{ display: 'none' }}>
                    <AudioRecorder
                    onRecordingComplete={addAudio}
                    recorderControls={recorderControls}
                    // showVisualizer={true}
                    // downloadOnSavePress={true}
                    />
          </div>
          <div style={{ display: 'flex', flexDirection:'column',justifyContent: 'center', marginBottom: 24 }}>
                {!isRecording && audioSourceURL==="" && (
                <div style={{ margin: 'auto', marginBottom: '10px' }}>
                  <img onClick={()=>{handlePlayPause()}} src="assets/colmic.png" alt=""  style={isPlay ? {display:'none', }:{width: '40%',margin:'auto'}} />
                </div>
                )}
                {isRecording && audioSourceURL==="" && (
                <div>
                    <p>{recorderControls.recordingTime}</p>
                    <p onClick={recorderControls.stopRecording}>녹음 멈춰!!</p>
                </div>
                )}
                {audioSourceURL && (
                    <MusicPlay audioSourceURL= {audioSourceURL}/>
                    )}
                    {isRecording && audioSourceURL && (
                    <button onClick={handleRestartRecording} style={{ width: '30%', margin: 'auto', borderRadius:'10px'}}>다시하기</button>
                    )}
                    {isRecording && audioSourceURL&&(
                    <button onClick={recordresult} style={{ width: '30%', margin: 'auto', borderRadius:'10px'}}>
                        다음으로
                    </button>
                    )}
            </div>
        </ModalContainer>
      </Background>
  );
};

export default MusicSing;
