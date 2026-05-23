import React from 'react';

const Title = ({ Title, subTitle, align = 'text-center', font = 'font-bold' }) => {
  return (
    <div className={`my-8 px-4 ${align}`}>
      <h1
        className={`text-3xl md:text-3xl text-blue-900 lg:text-3xl ${font} tracking-tight leading-tight`}
      >
        {Title}
      </h1>
      <p className="mt-2 text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
        {subTitle}
      </p>
      <div className="mt-3 w-24 h-1 bg-cyan-600 mx-auto rounded-full shadow-md"></div>
    </div>
  );
};

export default Title;
