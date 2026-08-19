const Spinner = ({ size = "md" }) => {
  const s = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${s} border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin`} />
    </div>
  );
};

export default Spinner;
