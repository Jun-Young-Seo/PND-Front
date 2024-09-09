import * as S from './DiagramStyle.jsx';
import { useEffect, useState } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { API } from '../../api/axios.js';

import ViewCode from '../../components/Diagram/ViewCode.jsx';

function ErdDiagram({ selectedProjectId }) {
    const [codeKey, setCodeKey] = useState(0);
    const [erdCode, setErdCode] = useState(null);
    const [tableName, setTableName] = useState(null);

    // viewCode가 변할 때마다 실행 -> Mermaid 초기화 및 다이어그램 렌더링
    useEffect(() => {
        const renderDiagram = () => {
            console.log("Rendering diagram with viewCode:", erdCode);
            const diagramContainer = document.getElementById("diagram-container");
            if (diagramContainer && erdCode && erdCode.trim()) {
                diagramContainer.innerHTML = `<div class="mermaid">${erdCode}</div>`;
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
    }, [erdCode]);


    const handleErdClick = (event) => {
        let target = event.target;

        // 부모 요소를 탐색하면서 텍스트가 있는 요소를 찾음
        while (target && !target.textContent.trim() && target.parentNode) {
            target = target.parentNode;
        }

        // 텍스트 추출
        const tableName = target ? target.textContent.trim() : null;

        if (tableName) {
            setTableName(tableName);
            console.log("선택한 테이블 이름: ", tableName);
        } else {
            console.log("클릭된 요소에서 테이블 이름을 찾을 수 없습니다.");
        }
    };

    const handleDeleteErd = () => {
        if (tableName && erdCode) {
            // ERD 문법에 맞게 테이블 정의를 찾고 제거하는 정규 표현식
            const tableRegex = new RegExp(`${tableName}\\s*{[^}]*}`, 'g');
            const updatedCode = erdCode.replace(tableRegex, '');
    
            // 상태 업데이트 및 다이어그램 재렌더링
            setErdCode(updatedCode);
            setTableName(null);
            setCodeKey(prevKey => prevKey + 1);
        } else {
            console.log("제거할 테이블 이름이 없거나 ERD 코드가 없습니다.");
        }
    };
        
    // 선택된 클래스 이름 알기
    useEffect(() => {
        //console.log("선택한 테이블 이름: " + tableName);
        handleDeleteErd();
    }, [tableName]);

    // viewCode가 수정될 때 호출되는 함수
    const handleViewCodeSave = () => {
        console.log("ViewCode가 수정되었습니다!\n" + erdCode);
        //fetchEditClassCode(viewCode); // 코드 수정 API 호출
    };

    // Mermaid 초기화 및 다이어그램 렌더링
    useEffect(() => {
        const renderDiagram = () => {
            console.log("Rendering diagram with viewCode:", erdCode); // 로그 추가
            const diagramContainer = document.getElementById("diagram-container");
            if (diagramContainer && erdCode && erdCode.trim()) {
                diagramContainer.innerHTML = `<div class="mermaid">${erdCode}</div>`;
                try {
                    mermaid.init(undefined, diagramContainer.querySelector('.mermaid'));
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                }
            }
        };

        renderDiagram();
    }, [erdCode]); // viewCode가 변할 때마다 실행


    // 레포지토리 gpt 분석 API 통신
    const fetchGpt = async () => {
        try {
            const requestBody = { repoId: selectedProjectId };
            const response = await API.patch(`api/pnd/diagram/er-gpt`, requestBody);

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
                // 모든 '.'을 '_'로 변경
                data = data.replace(/\./g, '_');

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

                setErdCode(formattedCode);
            } else {
                console.error("HTTP error: ", response.status);
            }
        } catch (err) {
            console.log("API 통신 중 오류 발생:", err);
        }
    };

    // 선택한 레포지토리 mermaid 코드 가져오기
    const fetchErdMermaid = async () => {
        try {
            const response = await API.get(`api/pnd/diagram/er`, {
                params: {
                    repoId: selectedProjectId, // 요청에 쿼리 매개변수로 repoId 전달
                },
            });
            if (response.status === 200) {
                const data = response.data.data;
                if (data) {
                    console.log('Mermaid 코드:', data);
                } else {
                    console.log('Erd Mermaid 코드가 존재하지 않음. GPT 분석 시작...');
                    await fetchGpt(); // Mermaid 코드가 없으면 GPT 분석 시작
                }
            } else {
                console.error("HTTP error: ", response.status);
                await fetchGpt(); // Mermaid 코드가 없으면 GPT 분석 시작
            }
        } catch (err) {
            console.log("API 통신 중 오류 발생:", err);
        }
    };

    // 컴포넌트가 마운트될 때 레포지토리 데이터를 가져옴
    useEffect(() => {
        if (selectedProjectId) {
            //fetchGpt();
            fetchErdMermaid();
        }
    }, [selectedProjectId]);

    return (
        <S.ErdLayout>
            <S.ErdPageLeft>
                <S.ErdPageLeftTop>
                    <S.ErdTitleTextBox>
                        <S.DiagramTypeTitleText>ERD DIAGRAM</S.DiagramTypeTitleText>
                    </S.ErdTitleTextBox>
                    <S.ErdEditButtons>
                        <S.RemoveComponentBtn onClick={handleDeleteErd}>컴포넌트 삭제</S.RemoveComponentBtn>
                        <S.Divider />
                        <S.RemoveAllBtn>전체 삭제</S.RemoveAllBtn>
                        <S.Divider />
                        <S.GenerateAiBtn >AI 자동생성</S.GenerateAiBtn>
                    </S.ErdEditButtons>
                </S.ErdPageLeftTop>
                <S.ErdResultBox>
                    <div id="diagram-container" onClick={(e) => handleErdClick(e)}>
                        {/* Mermaid 다이어그램이 이곳에 렌더링됩니다 */}
                    </div>
                </S.ErdResultBox>

            </S.ErdPageLeft>
            <S.ErdPageRight>
                <S.ErdCodeBox>
                    {erdCode && (
                        <ViewCode
                            key={codeKey}
                            viewCode={erdCode}
                            setViewCode={setErdCode}
                            onSave={handleViewCodeSave}
                        />
                    )}
                </S.ErdCodeBox>

            </S.ErdPageRight>
        </S.ErdLayout>

    )
}

export default ErdDiagram;