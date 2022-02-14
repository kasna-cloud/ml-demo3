import { PostgresDB } from "./postgres-db";
import { tap, concatMap, map } from "rxjs/operators";
import { MentionsSample } from "../../models/analytics/mentions";
import { Observable } from "rxjs";
import { ISink } from "../../interfaces/sample-interface";

export class MentionsTable extends PostgresDB implements ISink<MentionsSample> {
    
    private tableInitialised: boolean;
    private tableInitialisationStatement: string;

    constructor(psqlHost: string, psqlDatabase: string, dbUser: string, dbPassword: string) {
        super(psqlHost, psqlDatabase, dbUser, dbPassword);
        this.tableInitialised = false;
        this.tableInitialisationStatement = `
            CREATE TABLE IF NOT EXISTS mentions (
                sourcechain text NOT NULL,
                timestamp timestamptz NOT NULL,
                category text NOT NULL,
                entity text NOT NULL,
                count int NOT NULL,
                PRIMARY KEY (sourcechain, timestamp, category, entity)
            );
        `;
    }
    
    public save(mentionsSample: MentionsSample): Observable<MentionsSample> {
        const sourceChain = mentionsSample.processChain.join(':');
        const insert = super.insertItems(
            'INSERT INTO mentions (sourcechain, timestamp, category, entity, count)',
            mentionsSample.categories.reduce((sqlValues, category) => {
                category.mentions.forEach(mention => {
                    sqlValues.push([
                        sourceChain,
                        mentionsSample.timestamp,
                        category.category.toUpperCase(),
                        mention.entity,
                        mention.count
                    ]);
                });
                return sqlValues;
            }, [])
        ).pipe(
            map(() => mentionsSample)
        );

        if (this.tableInitialised) {
            return insert;
        } else {
            return super.initialiseTable(this.tableInitialisationStatement).pipe(
                tap(() => {
                    this.tableInitialised = true;
                }),
                concatMap(() => insert)
            );
        }
    }
}