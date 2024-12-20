import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import App from './App';

// Pages
import Main from './pages/main/Main';
import MyProjects from './pages/myproject/MyProjects';
import ReadMe from './pages/readme/Readme';
import Retro from './pages/retro/Retro';
import Team from './pages/Team/Team';
import LoginModal from './components/Login/LoginModal';
import Report from './pages/report/Report';
import Diagram from './pages/diagram/Diagram';

import ClassDiagram from './pages/diagram/ClassDiagram';
import SequenceDiagram from './pages/diagram/SequenceDiagram';
import ErdDiagram from './pages/diagram/ErdDiagram';

import MyPageREADME from './pages/myproject/MyPageREADME/MyPageREADME';
import MyPageClassDiagram from './pages/myproject/MyPageClassDiagram/MyPageClassDiagram';
import MyPageERD from './pages/myproject/MyPageERD/MyPageERD';
import MyPageGithubReport from './pages/myproject/MyPageGithubReport/MyPageGithubReport';
import MyPageSequenceDiagram from './pages/myproject/MyPageSequenceDiagram/MyPageSequenceDiagram';


const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          path: '',
          element: <Main />,
        },
  
        {
          path: 'readme',
          element: <ReadMe />,
        },
        {
          path: 'retro',
          element: <Retro />,
        },
        {
          path: 'myProjects',
          element: <MyProjects />,
        },
        {
          path: 'team',
          element: <Team />,
        },
        {
          path: 'login',
          element: <LoginModal />,
        },
        {
          path: 'report',
          element: <Report />
        },
        {
          path: 'diagram',
          element: <Diagram />,
          children: [
            {
              path: 'class',
              element: <ClassDiagram/>
            },
            {
              path: 'sequence',
              element: <SequenceDiagram/>
            },
            {
              path: 'erd',
              elemtn: <ErdDiagram/>
            }
          ]
          
        },
        {
          path: 'mypageREADME',
          element: <MyPageREADME/>
        },
        {
          path: 'mypageClassDiagram',
          element: <MyPageClassDiagram/>
        },
        {
          path: 'mypageSequenceDiagram',
          element: <MyPageSequenceDiagram/>
        },
        {
          path: 'mypageERD',
          element: <MyPageERD/>
        },
        {
          path: 'mypageGithubReport',
          element: <MyPageGithubReport/>
        }
      ],
    },
  ]);
  
  export default router;