import * as pgPromise from 'pg-promise';
const pgp: pgPromise.IMain = pgPromise();
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export abstract class PostgresDB {

    protected readonly db: pgPromise.IDatabase<void>;
    
    constructor(psqlHost: string, psqlDatabase: string, dbUser: string, dbPassword: string, port: number=5432) {
        const config = {
            host: psqlHost,
            port: port,
            database: psqlDatabase,
            user: dbUser,
            password: dbPassword,
            max: 1
        };
        this.db = pgp(config);
    }

    public initialiseTable(tableDefinitionUpsertStatement: string): Observable<void> {
        return from(this.db.none(tableDefinitionUpsertStatement));
    }


    private buildParamsPart(items: any[][]): string {
        const itemCount = items.length;
        const paramCount = items[0].length;
        const totalCount = itemCount * paramCount;
        if (!items.every(i => i.length === paramCount)) {
            throw Error('Every item needs to have the same number of parameters!');
        }
        let valueClause: string = '';
        for (let pi = 1; pi <= totalCount; pi++) {
            if (pi === totalCount) {
                valueClause += `$${pi}`
            } else if (pi % paramCount === 0) {
                valueClause += `$${pi}), (`
            } else {
                valueClause += `$${pi}, `
            }
        }
        return valueClause;
    }

    public insertItems(insertStatement: string, items: any[][]):  Observable<void> {
        if (items.length === 0) {
            return of(null);
        }
        return from(this.db.none(
            `${insertStatement} VALUES (${this.buildParamsPart(items)})`,
            items.reduce<any[]>((all, item) => {
                all.push(...item);
                return all;
            }, [])
        )).pipe(
            catchError(err => {
                if (err.includes('duplicate key value violates unique constraint')) {
                    console.warn('Unable to insert row as minute has already been accounted for.')
                }
                throw err;
            })
        );
    }
}