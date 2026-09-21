import React from 'react';
import ServiceDetailsMain from '../components/ServicePage/ServiceDetailsMain';
import CostumerReview from '../components/ServicePage/ServiceCustomerReview';
import FrequentlyBookTogether from '../components/ServicePage/FrequentlyBookTogether';

const ServiceDetails = ({ product }) => {
  return (
    <>
      <ServiceDetailsMain product={product} />
      <FrequentlyBookTogether />
      <CostumerReview product={product} />
    </>
  );
};

export default ServiceDetails;
