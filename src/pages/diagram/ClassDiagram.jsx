import * as S from './DiagramStyle.jsx';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { API } from '../../api/axios.js';
import { useLocation, useNavigate } from 'react-router-dom';
// component
import ClassEditor from '../../components/Diagram/ClassEditor.jsx';
import RelationshipEditor from '../../components/Diagram/RelationshipEditor.jsx';
import ViewCode from '../../components/Diagram/ViewCode.jsx';
import ThemeTemplate from '../../components/Diagram/ThemeTemplate.jsx';
import Loader from '../../components/Diagram/Loader.jsx';

function ClassDiagram({ selectedProjectId, onClickCreateBtn, viewCode, setViewCode }) {
    const [codeKey, setCodeKey] = useState(0);
    const [className, setClassName] = useState('');
    const [variables, setVariables] = useState('');
    const [methods, setMethods] = useState('');
    const [selectedClass, setSelectedClass] = useState(null); // 선택된 클래스 이름
    //const [viewCode, setViewCode] = useState(null);  // 초기 상태를 빈 문자열로 설정
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [selectedTheme, setSeletedTheme] = useState(null); // 선택한 테마

    const [isClickDeleteClassBtn, setIsClickDeleteClassBtn] = useState(false); // 클래스 삭제 버튼 클릭 상태
    const [isClickGenerateAiBtn, setIsClickGetnerateAiBtn] = useState(false); // AI 자동생성 버튼 클릭 상태
    const [isClickDeleteComponentBtn, setIsClickDeleteComponentBtn] = useState(false); // 컴포넌트 삭제 버튼 클릭 상태

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const renderDiagram = () => {
            console.log("Rendering diagram with viewCode:", viewCode);
            const diagramContainer = document.getElementById("diagram-container");
            if (diagramContainer && viewCode !== null) {
                if (viewCode.trim() === '') {
                    diagramContainer.innerHTML = ''; // 전체 삭제 시 다이어그램 초기화
                } else {
                    diagramContainer.innerHTML = `<div class="mermaid">${viewCode}</div>`;
                    // Mermaid 렌더링을 지연시킴
                    setTimeout(() => {
                        try {
                            mermaid.init(undefined, diagramContainer.querySelector('.mermaid'));
                        } catch (error) {
                            if (error.name === 'UnknownDiagramError') {
                                console.error("Unknown diagram type error:", error);
                                diagramContainer.innerHTML = '<p>다이어그램을 렌더링할 수 없습니다. 코드 형식을 확인하세요.</p>';
                            } else {
                                console.error("Mermaid rendering error:", error);
                                diagramContainer.innerHTML = '<p>다이어그램 렌더링 중 오류가 발생했습니다.</p>';
                            }
                        }
                    }, 100); // 필요에 따라 100ms 지연
                }
            }
        };

        if (!loading) {
            renderDiagram();  // 로딩이 완료된 후에만 다이어그램을 렌더링
        }

    }, [viewCode, loading]);

    // 추가 버튼 핸들러
    const handleAddButton = () => {
        const newClassCode = `
        class ${className} {
            ${variables.split('\n').map(v => `+${v}`).join('\n')}
            ${methods.split('\n').map(m => `+${m}()`).join('\n')}
        }
    `;
        setViewCode(prevCode => prevCode + newClassCode);
        setCodeKey(prevKey => prevKey + 1);
    };

    // 관계 추가 핸들러
    const handleAddRelation = ({ classA, classB, relation }) => {
        const relationMermaidSyntax = {
            '연관': '--',
            '일반화': '<|--',
            '실체화': '<|..',
            '의존': '-->',
            '인터페이스 의존': '..|>',
            '합성': '*--',
            '집합': 'o--',
        };
        const newRelationCode = `
            ${classA} ${relationMermaidSyntax[relation]} ${classB} : "${relation}"
        `;
        setViewCode(prevCode => prevCode + newRelationCode);
        setCodeKey(prevKey => prevKey + 1);
    };

    // 클래스 클릭 핸들러
    const handleClassClick = (className) => {
        setSelectedClass(className);
    };

    // 편집 버튼 상태 관리
    const setStateDeleteComponentBtn = () => {
        setIsClickDeleteComponentBtn(true);
    };
    const setStateDeleteClassBtn = () => {
        setIsClickDeleteClassBtn(true);
    };


    // 부분 삭제 핸들러
    const handleDeleteComponent = (classToDelete) => {
        if (classToDelete) {
            const updatedCode = viewCode.replace(new RegExp(`class ${classToDelete} {[^}]*}`, 'g'), '');
            setViewCode(updatedCode);
            setSelectedClass(null);
            setCodeKey(prevKey => prevKey + 1);
        }
    };

    // 클래스 삭제 핸들러
    const handleDeleteClass = (classToDelete) => {
        if (classToDelete) {
            console.log("클래스 삭제 핸들러");
            // 1. 클래스 선언 제거
            let updatedCode = viewCode.replace(new RegExp(`class\\s+${classToDelete}\\s*{[^}]*}`, 'g'), '');

            // 2. 클래스 관련 관계 제거
            const relationPatterns = [
                new RegExp(`\\b${classToDelete}\\b\\s*--.*`, 'g'), // 클래스가 왼쪽에 있는 경우
                new RegExp(`.*--\\s*\\b${classToDelete}\\b`, 'g'),  // 클래스가 오른쪽에 있는 경우
                new RegExp(`\\b${classToDelete}\\b\\s*:\\s*.*`, 'g'), // 클래스가 관계 주체일 때
                new RegExp(`\\b\\w+\\b\\s*-->\\s*\\b${classToDelete}\\b`, 'g') // 클래스가 종속 관계일 때
            ];

            relationPatterns.forEach(pattern => {
                updatedCode = updatedCode.replace(pattern, '');
            });

            // 3. 빈 줄 제거 (남은 빈 줄을 제거합니다)
            updatedCode = updatedCode.replace(/^\s*[\r\n]/gm, '');

            // 4. setViewCode와 상태 초기화
            setViewCode(updatedCode);
            setSelectedClass(null); // 선택된 클래스 초기화
            setCodeKey(prevKey => prevKey + 1); // 코드 키 업데이트
        }
    };

    const handleDeleteAllBtn = () => {
        setViewCode(' '); // viewCode를 빈 문자열로 설정하여 모든 다이어그램 요소 삭제
        setSelectedClass(null); // 선택된 클래스 초기화
        setCodeKey(prevKey => prevKey + 1); // 코드 키 업데이트
    }

    // 선택한 테마로 코드 적용하는 메소드
    const saveSelectedTheme = (selectedTheme) => {
        setSeletedTheme(selectedTheme);
    }

    const handleSelectedTheme = () => {
        if (selectedTheme) {
            // Mermaid 테마 설정
            mermaid.initialize({
                theme: selectedTheme.toLowerCase() // 테마 이름을 소문자로 변환하여 적용 (light, dark 등)

            });

            // 다이어그램을 다시 렌더링
            const diagramContainer = document.getElementById("diagram-container");
            if (diagramContainer && viewCode !== null) {
                diagramContainer.innerHTML = `<div class="mermaid">${viewCode}</div>`;
                try {
                    mermaid.init(undefined, diagramContainer.querySelector('.mermaid'));
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                }
            }
        }
    }
    useEffect(() => {
        console.log("선택한 테마: " + selectedTheme);
        handleSelectedTheme();
    }, [selectedTheme]);

    // 선택된 클래스 이름 알기
    useEffect(() => {
        console.log(selectedClass);
        //handleDeleteClass();
        if (isClickDeleteClassBtn && selectedClass) {
            console.log("클래스 삭제 중...");
            handleDeleteClass(selectedClass);
            setIsClickDeleteClassBtn(false); // 삭제 후 상태 초기화
        }
    }, [selectedClass, isClickDeleteClassBtn]);

    useEffect(() => {
        console.log(selectedClass);
        //handleDeleteClass();
        if (isClickDeleteComponentBtn && selectedClass) {
            console.log("클래스 삭제 중...");
            handleDeleteComponent(selectedClass);
            setIsClickDeleteComponentBtn(false); // 삭제 후 상태 초기화
        }
    }, [selectedClass, isClickDeleteComponentBtn]);

    // 유저토큰
    const userToken = localStorage.getItem('token');

    useEffect(() => {
        console.log("클래스네임 변경");

    }, [className]);

    useEffect(() => {
        if (isClickDeleteClassBtn && !selectedClass) {
            console.log("클래스 삭제 버튼 클릭됨");
        }
    }, [isClickDeleteClassBtn])

    useEffect(() => {
        if (isClickDeleteComponentBtn && !selectedClass) {
            console.log("컴포넌트 삭제 버튼 클릭됨");
        }
    }, [isClickDeleteComponentBtn])

    // viewCode가 수정될 때 호출되는 함수
    const handleViewCodeSave = () => {
        console.log("ViewCode가 수정되었습니다!\n" + viewCode);
        //fetchEditClassCode(viewCode); // 코드 수정 API 호출
    };

    // 레포지토리 gpt 분석 API 통신
    const fetchGpt = async () => {
        setLoading(true); // 로딩 시작
        try {
            const requestBody = { repoId: selectedProjectId };
            const response = await API.patch(`api/pnd/diagram/class-gpt`, requestBody);

            if (response.status === 200) {
                let data = response.data.data;
                console.log('수정되기 전 GPT 분석 결과:', data);
                // 앞쪽 백틱 두 개 제거
                if (data.startsWith('```')) {
                    data = data.substring(3);
                }

                // 뒤쪽 백틱 두 개 제거
                if (data.endsWith('```')) {
                    data = data.slice(0, -3);
                }

                // 관계와 클래스 정의를 구분하고 각 줄을 트림하여 공백을 제거합니다.
                let lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

                // 'classDiagram' 키워드를 추가
                let formattedCode = '\n'; // 클래스 다이어그램 키워드 추가

                // 클래스 관계와 정의를 구분하는 패턴
                const relationPattern = /(.*?) -> (.*?)/;
                const alreadyArrowPattern = /(.*?) --> (.*?)/; // 이미 '-->'인 패턴
                const classPattern = /class (.*?) \{/;

                // 관계와 클래스 정의를 분리
                lines.forEach(line => {
                    if (relationPattern.test(line) && !alreadyArrowPattern.test(line)) {
                        // '->'로 되어있고 '-->'로 안 되어있는 경우만 변경
                        formattedCode += `${line.replace(/->/g, '-->')}\n`;
                    } else {
                        // 관계 정의 외 나머지는 그대로 추가
                        formattedCode += `${line}\n`;
                    }
                });

                console.log('수정된 GPT 분석 결과:', formattedCode);

                setViewCode(formattedCode);
                setCodeKey(prevKey => prevKey + 1);
            } else {
                console.error("HTTP error: ", response.status);
            }
        } catch (err) {
            console.log("API 통신 중 오류 발생:", err);
        } finally {
            // 2초 후 로딩 상태를 false로 설정
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    };

    // 선택한 레포지토리 mermaid 코드 가져오기
    const fetchClassMermaid = async () => {
        try {
            const response = await API.get(`api/pnd/diagram/class`, {
                params: {
                    repoId: selectedProjectId, // 요청에 쿼리 매개변수로 repoId 전달
                },
            });
            if (response.status === 200) {
                const data = response.data.data;
                if (data) {
                    console.log('Mermaid 코드:', data);
                    setViewCode(data);  // 가져온 Mermaid 코드를 설정
                } else {
                    console.log('Mermaid 코드가 존재하지 않음. GPT 분석 시작...');
                    await fetchGpt(); // Mermaid 코드가 없으면 GPT 분석 시작
                }
            } else {
                console.error("HTTP error: ", response.status);
            }
        } catch (err) {
            console.log("API 통신 중 오류 발생:", err);
        }
    };

    // 컴포넌트가 마운트될 때 레포지토리 데이터를 가져옴
    useEffect(() => {
        if (selectedProjectId && onClickCreateBtn) {
            fetchClassMermaid();
            //fetchGpt();
        }
    }, [selectedProjectId]);

    // 코드가 변화될때마다 실행
    useEffect(() => {
        if (isClickGenerateAiBtn) {
            fetchGpt();
        }
    }, [isClickGenerateAiBtn]);

    // 다이어그램 생성
    const handleGenerateAi = () => {
        setIsClickGetnerateAiBtn(!isClickGenerateAiBtn);
    };

    // 마이프로젝트에서 수정 버튼 눌러서 온 경우
    useEffect(() => {
        const queryParam = new URLSearchParams(location.search);
        const repoId = queryParam.get('edit');
        if (repoId !== null) {
            fetchClassMermaidForEdit(repoId);
        }
    }, []);

    // 마이프로젝트에서 수정 버튼 눌러서 온 경우 실행시킬 함수
    // 혹시 수정기능때문에 꼬일까봐 따로 만들어뒀습니다.
    const fetchClassMermaidForEdit = async (repoId) => {
        try {
            const response = await API.get(`api/pnd/diagram/class`, {
                params: {
                    repoId: repoId, // 요청에 쿼리 매개변수로 repoId 전달
                },
            });
            if (response.status === 200) {
                const data = response.data.data;
                if (data) {
                    console.log('Mermaid 코드:', data);
                    setViewCode(data);  // 가져온 Mermaid 코드를 설정
                } else {
                    console.log('Mermaid 코드가 존재하지 않음. GPT 분석 시작...');
                    await fetchGpt(); // Mermaid 코드가 없으면 GPT 분석 시작
                }
            } else {
                console.error("HTTP error: ", response.status);
            }
        } catch (err) {
            console.log("API 통신 중 오류 발생:", err);
        }
    };
    return (
        <S.ClassLayout>
            {loading && <Loader />}
            <S.ClassLeft>
                <S.ClassTitleTextBox>
                    <S.DiagramTypeTitleText>CLASS DIAGRAM</S.DiagramTypeTitleText>
                </S.ClassTitleTextBox>
                <S.ClassEditButtons>
                    <S.DeleteComponentBtn onClick={setStateDeleteComponentBtn}>부분 삭제</S.DeleteComponentBtn>
                    <S.Divider />
                    <S.DeleteClassBtn onClick={setStateDeleteClassBtn}>클래스 삭제</S.DeleteClassBtn>
                    <S.Divider />
                    <S.DeleteAllBtn onClick={handleDeleteAllBtn}>전체 삭제</S.DeleteAllBtn>
                    <S.Divider />
                    <S.GenerateAiBtn onClick={handleGenerateAi}>AI 자동생성</S.GenerateAiBtn>
                </S.ClassEditButtons>
                <S.ClassDiagramResultBox>
                    <div id="diagram-container" onClick={(e) => handleClassClick(e.target.innerText)}>
                        {/* Mermaid 다이어그램이 이곳에 렌더링됩니다 */}
                    </div>
                </S.ClassDiagramResultBox>
            </S.ClassLeft>
            <S.ClassMid>
                <S.ClassTitleTextBox>
                    <S.DiagramTypeTitleText>EDIT DIAGRAM</S.DiagramTypeTitleText>
                </S.ClassTitleTextBox>
                <S.EditDiagramContainer>
                    <S.ClassAddButtonBox>
                        <S.AddButton onClick={handleAddButton}>추가</S.AddButton>
                    </S.ClassAddButtonBox>
                    <ClassEditor
                        className={className}
                        setClassName={setClassName}
                        variables={variables}
                        setVariables={setVariables}
                        methods={methods}
                        setMethods={setMethods}
                    />
                    <RelationshipEditor onAddRelation={handleAddRelation} />
                    <S.RelationshipAddButtonBox>
                        {/* <S.AddButton onClick={handleAddButton}>추가</S.AddButton> */}
                    </S.RelationshipAddButtonBox>

                </S.EditDiagramContainer>
            </S.ClassMid>
            <S.ClassRight>
                <S.ClassTitleTextBox>
                    <S.DiagramTypeTitleText>VIEW CODE</S.DiagramTypeTitleText>
                </S.ClassTitleTextBox>
                <S.ClassRightContainer>
                    <S.ClassViewCode>
                        {viewCode && (
                            <ViewCode
                                key={codeKey}
                                viewCode={viewCode}
                                setViewCode={setViewCode}
                                onSave={handleViewCodeSave}
                            />
                        )}
                    </S.ClassViewCode>
                    <ThemeTemplate
                        onSaveTheme={saveSelectedTheme}
                    />
                </S.ClassRightContainer>
            </S.ClassRight>
        </S.ClassLayout>
    );
}

export default ClassDiagram;