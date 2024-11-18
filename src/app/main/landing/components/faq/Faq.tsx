import React from 'react'
import FaqHeader from './FaqHeader'
import FaqCards from './FaqCards'

const Faq = () => {
  return (
    <div className='w-[100%] flex flex-col items-center justify-center space-y-20'>
      <FaqHeader />
      <FaqCards />
    </div>  
  )
}

export default Faq