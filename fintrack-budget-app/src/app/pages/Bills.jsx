import { useOutletContext } from "react-router-dom";
import BillsTab from "../components/BillsTab";

export default function Bills() {
  const context = useOutletContext();

  return (
    <BillsTab
      bills={context.data.bills || []}
      onAddBill={context.addBill}
      onDeleteBill={context.deleteBill}
      formatCurrency={context.formatCurrency}
    />
  );
}
