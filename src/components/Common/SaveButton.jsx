import styled from "styled-components";

// 저장하기 버튼 스타일
export const SaveBtnBox = styled.button`
width: 7.3vw;
height: 35px;
color: white;
text-align: center;
font-size: 0.8rem;
border-radius: 5px;
background: #36CDFF;
display:flex;
justify-content: center;
align-items: center;
position: absolute;
top: 10px;
right: 10px;
`;

export default function SaveBtn({onClick}) {
    return (
        <SaveBtnBox onClick={onClick}>저장하기</SaveBtnBox>
    )
}

