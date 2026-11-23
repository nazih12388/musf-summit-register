import React from 'react';
import { MusfSplashScreen as MusfSplashScreenComponent } from './MusfSplashScreen.jsx';

export interface MusfSplashScreenProps {
  onFinished?: () => void;
}

export const MusfSplashScreen: React.FC<MusfSplashScreenProps> = (props) => {
  return <MusfSplashScreenComponent {...props} />;
};

export default MusfSplashScreen;
