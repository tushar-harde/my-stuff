import { ErrorResponse } from "./error.model";
import { ColumnValue, Connection, Request, TYPES } from "tedious";
import { injectable } from "tsyringe";

export function setPropertiesDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
    const props = Object.keys(new constructor());
    return class extends constructor {
        [index: string]: any;
        constructor(...rows: any[]) {
            super();
            rows.forEach((column: ColumnValue) => {
                const colName = column.metadata.colName;
                const property = props.find((val) => val.toLocaleLowerCase() === colName.toLocaleLowerCase());
                if (property) {
                    this[property] = column.value
                }
            });
        }
    };
}


var config = {
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'msP@ssw@rd'
        }
    },
    options: {
        database: 'Workout'
    }
};

@injectable()
class Database {
    private connection = new Connection(config);
    constructor() {}

    test() {
        console.log(Reflect.getMetadataKeys(this))
    }

    executeProc(procName: string, data: Object, Type: any, callback: (error: ErrorResponse, result?: any) => any) {
        this.connection.connect((err) => {
            if (err) {
                callback({
                    message: err.message,
                    isError: true
                });
            } else {
                try {
                    var result: any[] = [];
                    var resultCount: number;
    
                    // create request to database
                    var request = new Request("SELECT TOP 1 * FROM tblUser", (err, rowCount, rows) => {
                        if (err) {
                            callback({
                                message: err.message,
                                isError: true
                            });
                            request.removeAllListeners();
                        } else {
                            resultCount = +rowCount;
                        }
                        this.connection.close();
                    });
    
                    // add parameter to request
                    for (const [key, value] of Object.entries(data)) {
                        request.addParameter(key, TYPES.Char, value.toString().length > 0 ? value : null);
                    }
    
                    // fetch rows
                    request.on('row', async (columns) => {
                        try {
                            const ErrSeverity = columns.find(column => column.metadata.colName == "ErrSeverity");
                            const ErrMsg = columns.find(column => column.metadata.colName == "ErrMsg");
                            if (ErrSeverity?.value > 0) {
                                throw new Error(ErrMsg?.value);
                            } else {
                                const typeObject = await Type.apply({}, columns);
                                result = result.concat(typeObject);
                            }                            
                        } catch (err: any) {
                            callback({
                                message: err.message,
                                isError: true
                            });
                            request.removeAllListeners();
                        }
                    });
    
                    // handle error
                    request.on("error", function (err) {
                        callback({
                            message: err.message,
                            isError: true
                        });
                        request.removeAllListeners();
                    });
    
                    // return result after request complete
                    request.on("requestCompleted", () => {                        
                        +resultCount > 1 ? callback({ isError: false }, result) : callback({ isError: false }, result[0]);
                        request.removeAllListeners();                
                    });
    
                    this.connection.execSql(request);
                } catch (error) {
                    // callback(error);
                    console.log(error);
                }
            }
        });
    }
}

export { Database }