import { PostgresDB } from "./postgres-db";
import { SentimentSample } from "../../models/analytics/sentiment";
import { tap, concatMap, map } from "rxjs/operators";
import { Observable } from "rxjs";
import { ISink } from "../../interfaces/sample-interface";

export class SentimentTable extends PostgresDB implements ISink<SentimentSample> {
    
    private tableInitialised: boolean;
    private tableInitialisationStatement: string;

    constructor(psqlHost: string, psqlDatabase: string, dbUser: string, dbPassword: string) {
        super(psqlHost, psqlDatabase, dbUser, dbPassword);
        this.tableInitialised = false;
        this.tableInitialisationStatement = `
            CREATE TABLE IF NOT EXISTS sentiment (
                sourcechain text NOT NULL,
                timestamp timestamptz NOT NULL,
                positive float NOT NULL,
                neutral float NOT NULL,
                negative float NOT NULL,
                mixed float NOT NULL,
                PRIMARY KEY (sourcechain, timestamp)
            );
        `;
    }
    
    public save(sentimentSample: SentimentSample): Observable<SentimentSample> {
        const insert = super.insertItems(
            'INSERT INTO sentiment (sourcechain, timestamp, positive, neutral, negative, mixed)',
            [[
                sentimentSample.processChain.join(':'),
                sentimentSample.timestamp,
                sentimentSample.sentiment.positive,
                sentimentSample.sentiment.neutral,
                sentimentSample.sentiment.negative,
                sentimentSample.sentiment.mixed
            ]]
        ).pipe(
            map(() => sentimentSample)
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