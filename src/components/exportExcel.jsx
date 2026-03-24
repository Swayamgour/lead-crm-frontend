import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = ({
    data = [],
    fileName = "data",
    sheetName = "Sheet1",
    formatData
}) => {

    const finalData = formatData ? formatData(data) : data;

    const worksheet = XLSX.utils.json_to_sheet(finalData);

    // ✅ Column width
    worksheet["!cols"] = Object.keys(finalData[0] || {}).map(() => ({
        wch: 20
    }));

    // ✅ Row height
    worksheet["!rows"] = finalData.map(() => ({
        hpt: 25
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(file, `${fileName}.xlsx`);
};