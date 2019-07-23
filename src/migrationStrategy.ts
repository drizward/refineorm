
/**
 * The strategy to handle a migration when data context is initialized on first time.
 */
export enum MigrationStrategy {

    /**
     * The strategy to disable code-first paradigm.
     * Database will never be created from the class structure.
     */
    Never,

    /**
     * The strategy which database will be written only when it's empty
     * or have no any table in it.
     */
    RecreateOnEmpty,

    /**
     * The strategy which database will always be re-written on run.
     * Any records will not be restored
     */
    RecreateOnRun,

    /**
     * The strategy which database will only be re-written when change
     * on the context models detected. Any records will not be restored
     */
    RecreateOnChange,

    /**
     * The strategy which database will be altered with basic configuration
     * when the models structures in current context are changed.
     * The records will be keeped accordingly as lower possiblity
     */
    BasicAlter,

    /**
     * The strategy which alteration on database will be handled automatically when models changed,
     * but the records alteration may be handled by your own definition
     */
    ManagedAlter,

    /**
     * The strategy which alteration will be run accordingly by the defined key or identifier,
     * or that migration may be run without any change happens to the models.
     */
    ManagedAlterOnRun

}