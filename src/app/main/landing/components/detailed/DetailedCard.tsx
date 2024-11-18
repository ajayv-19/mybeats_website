import React from "react";

interface DetailedCardProps {
  imgUrl: string;
}

const DetailedCard: React.FC<DetailedCardProps> = ({ imgUrl }) => {
  return (
    <div className="h-[300px] w-100vw md:h-[400px] md:w-[100%]">
      <img src={imgUrl} />
    </div>
  );
};

export default DetailedCard;
