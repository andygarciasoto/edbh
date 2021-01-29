CREATE TABLE [dbo].[Component]
(
	[id]					INT IDENTITY (1, 1) NOT NULL,
	[name]					NVARCHAR(100) NOT NULL,
	[status]				NVARCHAR (50) NOT NULL,
    [entered_by]			NVARCHAR (100) NOT NULL,
    [entered_on]			DATETIME NOT NULL,
    [last_modified_by]		NVARCHAR (100) NOT NULL,
    [last_modified_on]		DATETIME NOT NULL,
	CONSTRAINT [PK_Component_Id] PRIMARY KEY CLUSTERED ([id] ASC)
)
