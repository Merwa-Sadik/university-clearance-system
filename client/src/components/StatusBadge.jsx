const StatusBadge = ({ status }) => {
  const map = {
    Pending:  "badge-pending",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
  };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
};

export default StatusBadge;
