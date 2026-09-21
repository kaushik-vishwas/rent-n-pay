// 'use client';

// import { useState } from 'react';
// import RentPrdctDesc from '../components/RentPrdctDetail/RentPrdctDesc';
// import RentPrdctMain from '../components/RentPrdctDetail/RentPrdctMain';
// import SimilarRental from '../components/RentPrdctDetail/SimilarRental';
// import CostumerReview from '../components/RentPage/CostumerReview';
// import WorkFlow from '../components/RentPage/WorkFlow';

// const RentPrdctDetail = ({ product, offer }) => {
//   const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

//   return (
//     <>
//       <RentPrdctMain
//         product={product}
//         offer={offer}
//         selectedVariantIdx={selectedVariantIdx}
//         setSelectedVariantIdx={setSelectedVariantIdx}
//       />
//       <RentPrdctDesc
//         product={product}
//         selectedVariantIdx={selectedVariantIdx}
//       />
//       <SimilarRental />
//       <CostumerReview product={product} />
//       <WorkFlow />
//     </>
//   );
// };

// export default RentPrdctDetail;

'use client';

import { useState } from 'react';
import RentPrdctDesc from '../components/RentPrdctDetail/RentPrdctDesc';
import RentPrdctMain from '../components/RentPrdctDetail/RentPrdctMain';
import SimilarRental from '../components/RentPrdctDetail/SimilarRental';
import RentCostumerReview from '../components/RentPage/RentCostumerReview';
import WorkFlow from '../components/RentPage/WorkFlow';

const RentPrdctDetail = ({ product, offer }) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  return (
    <>
      <RentPrdctMain
        product={product}
        offer={offer}
        selectedVariantIdx={selectedVariantIdx}
        setSelectedVariantIdx={setSelectedVariantIdx}
      />
      <RentPrdctDesc
        product={product}
        selectedVariantIdx={selectedVariantIdx}
      />
      <SimilarRental currentProductId={product?._id} />
      <RentCostumerReview product={product} />
      <WorkFlow />
    </>
  );
};

export default RentPrdctDetail;
