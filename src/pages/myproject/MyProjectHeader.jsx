import React from 'react';
import { HeaderContainer, UserInfo, UserName, Divider, UserEmail, ButtonContainer, LogOutButton, LeaveButton } from './Styles/MyProjectsHeaderStyles';
import { Helmet } from 'react-helmet';

const MyProjectHeader = ({ userName, userEmail }) => {
  return (
    <HeaderContainer>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Edu+QLD+Beginner&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </Helmet>

      <UserInfo>
        <UserName>{userName}</UserName>
        <Divider />
        <UserEmail>{userEmail}</UserEmail>
      </UserInfo>
      <ButtonContainer>
        <LogOutButton>로그아웃</LogOutButton>
        <LeaveButton>회원탈퇴</LeaveButton>
      </ButtonContainer>
    </HeaderContainer>
  );
};

export default MyProjectHeader;