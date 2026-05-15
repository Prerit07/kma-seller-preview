import React from "react";
import { Menu, MenuProps } from "@mui/material";

export interface PositionMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  children?: React.ReactNode;
  menuId?: string;
  menuProps?: Partial<MenuProps>; // optional override for Menu props
}

const PositionMenu: React.FC<PositionMenuProps> = ({
  anchorEl,
  open,
  handleClose,
  children,
  menuId = "account-menu",
  menuProps,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      slotProps={{
        paper: {
          elevation: 0,
          style: {
            borderRadius: '10px',
            minWidth: '300px'
          },
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      {...menuProps} // allow overrides if needed
    >
      {children}
    </Menu>
  );
};

export default PositionMenu;
