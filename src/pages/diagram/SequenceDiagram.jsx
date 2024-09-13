import { useState, useEffect } from 'react';
import ViewCode from '../../components/Diagram/ViewCode.jsx';
import * as S from './DiagramStyle.jsx';
import axios from 'axios';
import mermaid from 'mermaid';
import { API } from '../../api/axios.js';
import SequenceEditor from '../../components/Diagram/SequenceEditor.jsx';
import SequenceRelationshipEditor from '../../components/Diagram/SequenceRelationshipEditor.jsx';
import ThemeTemplate from '../../components/Diagram/ThemeTemplate.jsx';


function SequenceDiagram({ selectedProjectId, onClickCreateBtn, viewCode, setViewCode }) {
    const [codeKey, setCodeKey] = useState(0);
    const [sequenceCode, setSequenceCode] = useState(null); // 시퀀스 다이어그램 코드 담는 변수
    const [className1, setClassName1] = useState('');
    const [className2, setClassName2] = useState('');
    const [selectedTheme, setSeletedTheme] = useState(null); // 선택한 테마


    // viewCode가 변할 때마다 실행 -> Mermaid 초기화 및 다이어그램 렌더링
    useEffect(() => {
        const renderDiagram = () => {
            console.log("Rendering diagram with viewCode:", viewCode);
            const diagramContainer = document.getElementById("diagram-container");
            if (diagramContainer && viewCode && viewCode.trim()) {
                diagramContainer.innerHTML = `<div class="mermaid">${viewCode}</div>`;
                try {
                    mermaid.init(undefined, diagramContainer.querySelector('.mermaid'));
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                }
            }
        };

        // Mermaid 렌더링을 약간 지연시켜 DOM이 준비된 후 실행
        setTimeout(renderDiagram, 0);
        //fetchEditClassCode(sequenceCode);
    }, [viewCode]);

    // viewCode가 수정될 때 호출되는 함수
    const handleViewCodeSave = () => {
        console.log("ViewCode가 수정되었습니다!\n" + viewCode);
        //fetchEditClassCode(viewCode); // 코드 수정 API 호출
    };

    // 추가 버튼 핸들러
    const handleAddButton = () => {
        if (className1 && className2) {
            const newSequenceCode = `
            participant ${className1} as ${className2}
            `;
            setViewCode(prevCode => prevCode + newSequenceCode);
            setCodeKey(prevKey => prevKey + 1);
        } else {
            console.log("두 클래스 이름을 모두 입력해야 합니다.");
        }
    };
    // 관계 추가 핸들러
    const handleAddRelation = ({ classA, classB, relation, message }) => {
        const relationMermaidSyntax = {
            '요청': '->',
            '응답': '-->>',
        };
        const newRelationCode = `
                ${classA} ${relationMermaidSyntax[relation]} ${classB} : "${message}"
            `;
        setViewCode(prevCode => prevCode + newRelationCode);
        setCodeKey(prevKey => prevKey + 1);
    };

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
    },[selectedTheme]);

    // Mermaid 초기화 및 다이어그램 렌더링
    useEffect(() => {
        const renderDiagram = () => {
            console.log("Rendering diagram with viewCode:", viewCode); // 로그 추가
            const diagramContainer = document.getElementById("diagram-container");
            if (diagramContainer && viewCode && viewCode.trim()) {
                diagramContainer.innerHTML = `<div class="mermaid">${viewCode}</div>`;
                try {
                    mermaid.init(undefined, diagramContainer.querySelector('.mermaid'));
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                }
            }
        };

        renderDiagram();
    }, [viewCode]); // viewCode가 변할 때마다 실행

    // 유저토큰
    const userToken = localStorage.getItem('token');

    // authInstance가 이미 axios 인스턴스로 정의되어 있다고 가정
    const authInstance = axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
        },
    });

    // 레포지토리 gpt 분석 API 통신
    const fetchGpt = async () => {
        try {
            const requestBody = { repoId: selectedProjectId };
            const response = await API.patch(`api/pnd/diagram/sequence-gpt`, requestBody);

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


                // 관계와 클래스 정의를 분리하고 각 줄을 트림하여 공백을 제거합니다.
                let lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

                // 'classDiagram' 키워드를 추가
                let formattedCode = '\n';

                // 클래스 관계와 정의를 구분하는 패턴
                const relationPattern = /(.*?) -> (.*?)/;
                const classPattern = /class (.*?) \{/;

                // 관계와 클래스 정의를 분리
                lines.forEach(line => {
                    if (relationPattern.test(line)) {
                        formattedCode += `${line}\n`;
                    } else if (classPattern.test(line)) {
                        formattedCode += `\n${line}\n`;
                    } else {
                        formattedCode += `  ${line}\n`;
                    }
                });

                console.log('수정된 GPT 분석 결과:', formattedCode);

                setViewCode(formattedCode);
            } else {
                console.error("HTTP error: ", response.status);
            }
        } catch (err) {
            console.log("API 통신 중 오류 발생:", err);
        }
    };

    // 선택한 레포지토리 mermaid 코드 가져오기
    const fetchSequenceMermaid = async () => {
        try {
            const response = await API.get(`api/pnd/diagram/sequence`, {
                params: {
                    repoId: selectedProjectId, // 요청에 쿼리 매개변수로 repoId 전달
                },
            });
            if (response.status === 200) {
                const data = response.data.data;
                if (data) {
                    console.log('Mermaid 코드:', data);
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
            //fetchGpt();
            fetchSequenceMermaid();
        }
    }, [selectedProjectId]);

    return (
        <S.SequenceLayout>
            <S.SequencePageLeft>
                <S.ClassTitleTextBox>
                    <S.DiagramTypeTitleText>SEQUENCE DIAGRAM</S.DiagramTypeTitleText>
                </S.ClassTitleTextBox>
                <S.ClassEditButtons>
                    <S.DeleteAllBtn>전체 삭제</S.DeleteAllBtn>
                    <S.Divider />
                    <S.GenerateAiBtn>AI 자동생성</S.GenerateAiBtn>
                </S.ClassEditButtons>

                <S.SequenceResultBox>
                    <div id="diagram-container">
                        {/* Mermaid 다이어그램이 이곳에 렌더링됩니다 */}
                    </div>
                </S.SequenceResultBox>
            </S.SequencePageLeft>
            <S.ClassMid>
                <S.ClassTitleTextBox>
                    <S.DiagramTypeTitleText>EDIT DIAGRAM</S.DiagramTypeTitleText>
                </S.ClassTitleTextBox>
                <S.EditDiagramContainer>
                    <S.ClassAddButtonBox>
                        <S.AddButton onClick={handleAddButton}>추가</S.AddButton>
                    </S.ClassAddButtonBox>
                    <SequenceEditor
                        className1={className1}
                        setClassName1={setClassName1}
                        className2={className2}
                        setClassName2={setClassName2}
                    />
                    <SequenceRelationshipEditor onAddRelation={handleAddRelation} />

                </S.EditDiagramContainer>
            </S.ClassMid>

            <S.SequencePageRight>
                <S.ClassTitleTextBox>
                    <S.DiagramTypeTitleText>VIEW CODE</S.DiagramTypeTitleText>
                </S.ClassTitleTextBox>
                <S.SequenceCodeBox>
                    {viewCode && (
                        <ViewCode
                            key={codeKey}
                            viewCode={viewCode}
                            setViewCode={setViewCode}
                            onSave={handleViewCodeSave}
                        />
                    )}
                </S.SequenceCodeBox>
                <ThemeTemplate
                    onSaveTheme={saveSelectedTheme}
                />

            </S.SequencePageRight>
        </S.SequenceLayout>
    )
}

export default SequenceDiagram;