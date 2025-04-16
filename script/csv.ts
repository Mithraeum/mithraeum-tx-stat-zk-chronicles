export function convertArrayOfObjectsToCsvString(array: any[]): string {
    if (!array) {
        return "";
    }

    const allKeysObject: {[key: string]: boolean} = {};
    array.forEach((value) => {
        const objectKeys = Object.keys(value);
        objectKeys.forEach(key => {
            if (!allKeysObject[key]) {
                allKeysObject[key] = true;
            }
        })
    });

    const allKeys = Object.keys(allKeysObject);
    if (allKeys.length === 0) {
        return "";
    }

    const header = allKeys.join(",") + "\r\n";
    const data = array.map(item => {
        const itemValuesArrayFromUnifiedKeys = allKeys.map(key => {
            if (item[key] === undefined) {
                return "";
            }

            if (item[key] === null) {
                return "null";
            }

            return item[key].toString();
        });

        return itemValuesArrayFromUnifiedKeys.join(",");
    }).join("\r\n");

    return header + data;
}

export function convertCsvStringToArrayOfObjects(csvString: string): any[] {
    if (!csvString) {
        return [];
    }

    const stringRows = csvString.split("\r\n");
    if (stringRows.length === 0) {
        console.warn("Csv string is not empty but does not contain header");
        return [];
    }

    const header = stringRows[0];
    const dataItems = stringRows.filter((_, index) => index !== 0);

    const allKeys = header.split(",");
    return dataItems.map(dataItem => {
        const dataItemValues = dataItem.split(",");
        const reconstructedObject: {[key: string]: string | undefined | null } = {};
        allKeys.forEach((key, index) => {
            if (dataItemValues[index] === "") {
                reconstructedObject[key] = undefined;
            } else if (dataItemValues[index] === "null") {
                reconstructedObject[key] = null;
            } else {
                reconstructedObject[key] = dataItemValues[index];
            }
        })

        return reconstructedObject;
    });
}