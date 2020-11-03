CREATE TABLE [dbo].[sysdiagrams] (
    [name]         [sysname]       NOT NULL,
    [principal_id] INT             NOT NULL,
    [diagram_id]   INT             IDENTITY (1, 1) NOT NULL,
    [version]      INT             NULL,
    [definition]   VARBINARY (MAX) NULL,
    CONSTRAINT [PK_SYSDIAGRAMS_Diagram_ID] PRIMARY KEY CLUSTERED ([diagram_id] ASC),
    CONSTRAINT [UNC_SYSDIAGRAMS_principal_name] UNIQUE NONCLUSTERED ([principal_id] ASC, [name] ASC)
);

