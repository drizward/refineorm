
export interface ConnectionConfig {

    /**
     * Provider type to use, e.g 'mysql' for MySQL and 'pgsql' for Postgre
     */
    type: string;

    /**
     * Host name or IP which database reside
     */
    host: string;

    /**
     * Username used for authorization
     */
    user: string;

    /**
     * Password used for authorization
     */
    password: string;

    /**
     * Name of database used in all operation
     */
    database: string;

    /**
     * Port number which database reside
     */
    port: number;

}