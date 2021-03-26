CREATE TABLE [dbo].[RoleComponent] (
    [rolecomponent_id] INT IDENTITY (1, 1) NOT NULL,
    [role_id]          INT NOT NULL,
    [component_id]     INT NOT NULL,
    [can_read]         BIT DEFAULT 0 NOT NULL,
    [can_write]        BIT DEFAULT 0 NOT NULL,
    CONSTRAINT [PK_RoleComponent_Id] PRIMARY KEY CLUSTERED ([rolecomponent_id] ASC),
    CONSTRAINT [FK_RoleComponent_Component_Id] FOREIGN KEY ([component_id]) REFERENCES [dbo].[Component] ([component_id]),
    CONSTRAINT [FK_RoleComponent_Role_Id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([role_id]),
    CONSTRAINT [UQRoleComponent] UNIQUE NONCLUSTERED ([role_id] ASC, [component_id] ASC)
);

