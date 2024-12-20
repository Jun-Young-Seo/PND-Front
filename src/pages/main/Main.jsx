import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import * as S from './MainStyle.jsx';
import axios from 'axios';
import { API } from '../../api/axios.js';

import LoginModal from '../../components/Login/LoginModal.jsx';
import Footer from '../../components/Footer/Footer.jsx';
// images
import ReadmeImg from '../../assets/images/main-readme-img.svg';
import DiagramImg from '../../assets/images/main-diagram-img.svg';
import ReportImg from '../../assets/images/main-report-img.svg';
import NextPageBtnIcon from '../../assets/images/main-down-arrow.png';
import ThirdPageTextImg from '../../assets/images/main-third-text.svg';

import FolderIcon from '../../assets/images/folder-icon.png';
import RetroIcon from '../../assets/images/retro-logo.png';
import MainImg from '../../assets/images/main-img.png';
import MainLogoWhiteImg from '../../assets/images/main-logo-white.svg';
import MainDecoIcon1 from '../../assets/images/main-deco-icon1.svg';
import MainDecoIcon2 from '../../assets/images/main-deco-icon2.svg';
import MainFeatureCard from '../../components/Main/MainFeatureCard.jsx';

function Main() {
    const outerDivRef = useRef();
    const [currentPage, setCurrentPage] = useState(1);
    const pageCount = 3; // 페이지 수
    const navigate = useNavigate();
    useEffect(() => {
        const wheelHandler = (e) => { // 휠 이벤트
            e.preventDefault(); // 기본 스크롤 동작 막기, 커스텀 스크롤 동작을 추가하기 위함
            const { deltaY } = e;
            const { scrollTop } = outerDivRef.current; // 현재 스크롤 위치
            const pageHeight = window.innerHeight; // 화면 세로길이 = 100vh
            const DIVIDER_HEIGHT = 5;
            if (deltaY > 0) {
                // 스크롤 내릴 때
                if (scrollTop >= 0 && scrollTop < pageHeight) {
                    // 현재 1페이지
                    outerDivRef.current.scrollTo({
                        top: pageHeight ,
                        left: 0,
                        behavior: "smooth",
                    });
                    setCurrentPage(2);
                } else if (scrollTop >= pageHeight && scrollTop < pageHeight * 2) {
                    // 현재 2페이지
                    outerDivRef.current.scrollTo({
                        top: pageHeight * 2 ,
                        left: 0,
                        behavior: "smooth",
                    });
                    setCurrentPage(3);
                }
            } else {
                // 스크롤 올릴 때
                if (scrollTop >= 0 && scrollTop < pageHeight) {
                    // 현재 1페이지
                    outerDivRef.current.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "smooth",
                    });
                } else if (scrollTop >= pageHeight && scrollTop < pageHeight * 2) {
                    // 현재 2페이지
                    outerDivRef.current.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "smooth",
                    });
                    setCurrentPage(1);
                } else {
                    // 현재 3페이지
                    outerDivRef.current.scrollTo({
                        top: pageHeight ,
                        left: 0,
                        behavior: "smooth",
                    });
                    setCurrentPage(2);
                }
            }
        };
        const outerDivRefCurrent = outerDivRef.current;
        outerDivRefCurrent.addEventListener("wheel", wheelHandler);
        return () => {
            outerDivRefCurrent.removeEventListener("wheel", wheelHandler);
        };
    }, []);

    // 다음 페이지로 이동하는 함수
    const goToNextPage = () => {
        const pageHeight = window.innerHeight;

        if (currentPage === 1) {
            outerDivRef.current.scrollTo({
                top: pageHeight, // 두 번째 페이지로 스크롤
                left: 0,
                behavior: "smooth",
            });
            setCurrentPage(2);
        } else if (currentPage === 2) {
            outerDivRef.current.scrollTo({
                top: pageHeight * 2, // 세 번째 페이지로 스크롤
                left: 0,
                behavior: "smooth",
            });
            setCurrentPage(3);
        } else if (currentPage === 3) {
            outerDivRef.current.scrollTo({
                top: 0, // 첫 번째 페이지로 스크롤
                left: 0,
                behavior: "smooth",
            });
            setCurrentPage(1);
        }
    };

    const moveTo = () => {
        if (sessionStorage.getItem("token")) {
            navigate('/myProjects');
        } else {
            navigate('/login');
        }
    }

    const location = useLocation();
    const [code, setCode] = useState(null);

    useEffect(() => {
        const fetchAccessToken = async () => {
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code');


            if (code) { // 인가 코드를 받아온 경우에만 실행하도록 하기
                try {
                    const response = await API.post(`/api/pnd/oauth/social/github?code=${code}`);
                    console.log(response);
                    const ACCESS_TOKEN = response.data.data.token;
                    // localStorage.setItem("token", ACCESS_TOKEN);
                    sessionStorage.setItem("token", ACCESS_TOKEN);
                    setCode(code);
                    await fetchUserData();

                    window.location.reload();
                } catch (error) {
                    console.error("Error during authentication:", error);
                }
            }
        };

        fetchAccessToken();
        //fetchUserData();
    }, [location]);

    const fetchUserData = async () => {
        // 세션에서 토큰 가져오기
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error("No token found in session storage");
        }
        if (token) {
            try {
                const response = await API.get(`api/pnd/user/profile`);
                const userInfo = {
                    name: response.data.data.name,
                    email: response.data.data.email,
                    image: response.data.data.image,
                    totalDocs: response.data.data.totalDocs,
                    totalReadmes: response.data.data.totalReadmes,
                    totalDiagrams: response.data.data.totalDiagrams,
                    totalReports: response.data.data.totalReports
                };
                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                const testInfo = sessionStorage.getItem('userInfo');
                const parsedUserInfo = JSON.parse(testInfo);
                console.log(parsedUserInfo.name);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // // 자동 슬라이드
    // useEffect(() => {
    //     const slideInterval = setInterval(() => {
    //         goToNextPage();
    //     }, 10000); // 10초마다 페이지 변경
    //     return () => clearInterval(slideInterval); // 컴포넌트 언마운트 시 타이머 제거
    // }, [currentPage]);


    return (
        <S.MainLayout ref={outerDivRef}>
            <S.MainFirstPage>
                <S.MainHeaderAndLoginBtn>
                    <S.MainSubHeaderText>소프트웨어 개발 과정에서의 문서화, 잘 되어가고 있나요?</S.MainSubHeaderText>
                    <S.MainHeaderText>
                        프로젝트 문서화의 모든 것 <br />
                        <S.MainLogoImg src={MainLogoWhiteImg} />에서 쉽고 간편하게
                    </S.MainHeaderText>
                    <S.MainSubHeaderText>지금 바로 깃허브로 로그인하고 시작해보세요</S.MainSubHeaderText>
                    <S.MainLoginButton onClick={moveTo}>
                        {sessionStorage.getItem('token') ? (
                            <> 마이페이지 가기 </>
                        ) : (
                            <> 깃허브 소셜 로그인 </>
                        )}
                    </S.MainLoginButton>
                </S.MainHeaderAndLoginBtn>
                <S.MainDecoIconImg1 src={MainDecoIcon1} />
                <S.MainDecoIconImg2 src={MainDecoIcon2} />
                {currentPage !== 3 && (
                    <S.NextPageBtn src={NextPageBtnIcon} onClick={goToNextPage} />
                )}
            </S.MainFirstPage>
            <S.MainSecondPage>
                <S.MainFeatures>
                    <MainFeatureCard
                        featureTitle='MAKE README'
                        featureDescriptionTitle={
                            <>
                                프로젝트를 세상에 알리고 싶나요?
                            </>}
                        featureDescription={
                            <>
                                리드미를 간편하게 제작해 프로젝트의 가치를 세상에 보여주세요.<br/>
                                마크다운 대시보드와 AI 자동 생성으로<br/>
                                보다 쉽고 빠르게 작성할 수 있습니다.<br/>
                            </>}
                        btnText='리드미 제작하러가기'
                        featureImg={ReadmeImg}
                    />
                    <MainFeatureCard
                        featureTitle='MAKE DIAGRAM'
                        featureDescriptionTitle={
                            <>
                                유지보수가 어렵다고 느껴지나요?
                            </>}
                        featureDescription={
                            <>
                                다이어그램을 통해 프로젝트의 구조를 체계적으로 관리하세요.<br/>
                                AI가 자동으로 다이어그램을 생성하고,<br/>
                                대시보드를 통해 간편하게 수정할 수 있습니다.
                            </>}
                        btnText='다이어그램 제작하러가기'
                        featureImg={DiagramImg}
                    />

                    <MainFeatureCard
                        featureTitle='MAKE GITHUB REPORT'
                        featureDescriptionTitle={
                            <>
                                프로젝트 완료 이후, 회고는 충분히 하셨나요?
                            </>}
                        featureDescription={
                            <>
                                깃허브 협업 데이터를 담은 맞춤형 회고 가이드를 제작해드립니다.<br/>
                                이를 통해 팀원들과 충분한 회고를 나눠보세요.<br/>
                                이미지로 간편하게 저장할 수도 있습니다.
                            </>}
                        btnText='회고 가이드 제작하러가기'
                        featureImg={ReportImg}
                    />

                </S.MainFeatures>
                {currentPage !== 3 && (
                    <S.NextPageBtn src={NextPageBtnIcon} onClick={goToNextPage} />
                )}

            </S.MainSecondPage>
            <S.MainThirdPage>
                <S.ThirdPageContentContainer>
                    <S.ThirdPageText src={ThirdPageTextImg} />
                    <S.StartBtn>
                        <S.MainLogoImg src={MainLogoWhiteImg} />
                        시작하기
                    </S.StartBtn>
                </S.ThirdPageContentContainer>


            </S.MainThirdPage>
        </S.MainLayout>
    )

}

export default Main;