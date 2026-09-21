'use client';

import React, { useState } from 'react';
import BuyPrdctMain from '../components/BuyPrdctDetail/BuyPrdctMain';
import BuyPrdctDesc from '../components/BuyPrdctDetail/BuyPrdctDesc';
import BuySimilarProducts from '../components/BuyPage/BuySimilarProducts';
import CostumerReview from '../components/RentPage/CostumerReview';

const BuyPrdctDetail = ({ product, offer }) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  return (
    <>
      <BuyPrdctMain
        product={product}
        offer={offer}
        selectedVariantIdx={selectedVariantIdx}
        setSelectedVariantIdx={setSelectedVariantIdx}
      />
      <BuyPrdctDesc product={product} selectedVariantIdx={selectedVariantIdx} />
      <BuySimilarProducts currentProductId={product?._id} />
      <CostumerReview product={product} />
    </>
  );
};

export default BuyPrdctDetail;
