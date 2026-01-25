import Lottie from 'lottie-react';
import authAnimation from '../assets/animations/Login Character Animation.json';

const AuthAnimation = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-72 h-72 md:w-[28rem] md:h-[28rem] lg:w-[34rem] lg:h-[34rem]">
        <Lottie
          animationData={authAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
    </div>
  );
};

export default AuthAnimation;