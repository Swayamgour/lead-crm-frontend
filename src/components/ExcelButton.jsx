import { exportToExcel } from "./exportExcel";

const ExcelButton = ({ data, fileName, sheetName, formatData, children }) => {
    const handleClick = () => {
        exportToExcel({ data, fileName, sheetName, formatData });
    };

    return (
        <button
            onClick={handleClick}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
            {children || "Download Excel"}
        </button>
    );
};

export default ExcelButton;