/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-max-depth */
import React, { useContext, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Context from '../context/Context';
import '../css/checkout.css';
import { removeLocalStorage } from '../services/localStorage';

export default function CheckoutResponse() {
  const { checkoutResponse, setCartItems, setCartItemsData, setCheckoutResponse } = useContext(Context);
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/carrinho" />;
  }

  if (!checkoutResponse) {
    fetch(`https://api.mercadopago.com/v1/payments/${id}?access_token=${process.env.REACT_APP_PROJECT_ACCESS_TOKEN}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCheckoutResponse(data);
      });
  }

  const mp = new MercadoPago(process.env.REACT_APP_PROJECT_PUBLIC_KEY);
  const bricksBuilder = mp.bricks();

  const renderStatusScreenBrick = async (param) => {
    const settings = {
      initialization: {
        paymentId: id, // id de pagamento gerado pelo Mercado Pago
      },
      callbacks: {
        onReady: () => {
          console.log('Status Screen Brick is ready');
        },
        onError: (error) => {
          console.log(error);
        },
      },
    };
    window.statusBrickController = await param.create(
      'statusScreen',
      'statusScreenBrick_container',
      settings,
    );
  };

  useEffect(() => {
    renderStatusScreenBrick(bricksBuilder);
  }, []);

  useEffect(() => {
    if (checkoutResponse?.status === 'approved') {
      removeLocalStorage('cart');
      setCartItems();
      setCartItemsData();
    }
  }, [checkoutResponse]);

  return (
    <section className="shopping-cart light">
      <div className="container container__payment">
        <div className="section-title text-center pt-5 pb-4">
          <h1>Dados do Pagamento</h1>
          <h3>Confira as informações do pagamento de sua compra</h3>
        </div>
        <div className="form-payment">
          <div id="statusScreenBrick_container"> </div>
        </div>
      </div>
    </section>
  );
}
