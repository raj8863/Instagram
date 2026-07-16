import React from 'react';
import Posts from './Posts';

const Feed = () => {
  return (
    // FIX: Replaced pl-[20] with a valid Tailwind layout padding mapping
    <div className='flex-1 my-4 flex flex-col items-center px-4 md:px-8'>
      <Posts />
    </div>
  );
};

export default Feed;