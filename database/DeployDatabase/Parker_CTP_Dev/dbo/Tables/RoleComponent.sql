CREATE TABLE [dbo].[RoleComponent]
(
	[rolecomponent_id] INT IDENTITY (1, 1) NOT NULL,
	[role_id] INT NOT NULL,
	[component_id] INT NOT NULL,
	[can_read] BIT NOT NULL DEFAULT 0,
	[can_write] BIT NOT NULL DEFAULT 0,
	CONSTRAINT [PK_RoleComponent_Id] PRIMARY KEY CLUSTERED ([rolecomponent_id] ASC),
	CONSTRAINT [FK_Role_Role_Id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([role_id]),
	CONSTRAINT [FK_Role_Component_Id] FOREIGN KEY ([component_id]) REFERENCES [dbo].[Component] ([component_id])
)
