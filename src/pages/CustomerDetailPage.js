import React from "react";
import { useParams } from "react-router-dom";

const CustomerDetailPage = ({ customers }) => {
  const { id } = useParams();  // 從 URL 取得 id
  const customer = customers.find((cust) => cust.id === parseInt(id));  // 根據 id 找到對應的客戶資料

  if (!customer) {
    return <div>客戶資料未找到</div>;
  }

  return (
    <div>
      <h2>客戶詳細資料</h2>
      <p>名稱: {customer.name}</p>
      <p>類型: {customer.type}</p>
      <p>聯絡人: {customer.contact1}</p>
      <p>電話: {customer.cellphone1}</p>
      {/* 顯示更多客戶資料 */}
    </div>
  );
}

export default CustomerDetailPage;

