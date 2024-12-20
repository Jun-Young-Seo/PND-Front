import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { ModalContent, CloseButton, Logo, ExplainText, DownloadButton, MyPageButton } from './FileDownloadStyle';
import logo from '../../../assets/images/download-logo.png';
import { Helmet } from 'react-helmet';
import { API } from "../../../api/axios";
import mermaid from 'mermaid';
import { Navigate, useNavigate } from "react-router-dom";
const FileDownload = ({ page, content, closeModal, selectedProjectId, userToken, selectedReportType, title}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isAvailableDownloadPage, setIsAvailableDownloadPage] = useState(false);
  const navigate = useNavigate();
  // `page` 값에 따라 `isDiagramPage` 상태 업데이트
  useEffect(() => {
    if (page === 'readme' || page === '/report') {
      setIsAvailableDownloadPage(true);
    } else {
      setIsAvailableDownloadPage(false);
    }
  }, [page]);

  useEffect(() => {
    const saveReadme = async () => {
      try {
        const requestBody = {
          repoId: selectedProjectId,
          content: content,
        };
        console.log('repoId : ', selectedProjectId);
        console.log('content : ', content);
        const response = await API.post(`api/pnd/readme`, requestBody);
        console.log('저장 성공:', response);
        setIsSaved(true);  // 파일 저장 완료로 상태 업데이트
      } catch (error) {
        console.error(error);
      }
    };

    if (page === 'readme') {
      saveReadme();
    } else if (page === '/diagram/class' || page === '/report' || page === '/diagram/sequence' || page==='/diagram/erd') {
      setIsSaved(true);  // Ensure this is set to true
    }
  }, [page, content, selectedProjectId, userToken]);

  const handleButtonClick = () => {
    navigate('/myprojects');
  };

  const downloadMD = () => {
    if (page === 'readme') {
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = "README.md";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if(page === '/report') {
      const reportConatiner = document.getElementById('reportImageBox');
      const imgElement = reportConatiner.querySelector("img");
      if (imgElement) {
        const svgData = new XMLSerializer().serializeToString(imgElement);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title}_${selectedReportType}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
  
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={closeModal}
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        content: {
          background: 'none',
          border: '2px solid',
          borderRadius: '22px',
          padding: 'none',
          position: 'static',
          width: 'auto',
          height: 'auto',
          maxWidth: '90%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Edu+QLD+Beginner&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </Helmet>

      <ModalContent>
        <CloseButton onClick={closeModal}>X</CloseButton>
        <Logo src={logo} style={{ marginBottom: '20px' }} />
        <ExplainText>
          {isSaved ? '마이 페이지에 저장되었습니다.' : '저장 중입니다...'} <br />
          {isSaved && '해당 파일을 다운로드 하시겠습니까?'}
        </ExplainText>
        
        {isAvailableDownloadPage && (
          <DownloadButton onClick={downloadMD} disabled={!isSaved}>다운로드 하기</DownloadButton>
        )}
        <MyPageButton disabled={!isSaved} onClick={handleButtonClick}>
          마이페이지로 가기
        </MyPageButton>
      </ModalContent>
    </Modal>
  );
};

export default FileDownload;