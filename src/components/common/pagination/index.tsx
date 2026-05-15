import { Pagination, PaginationItem } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPagination-ul": {
    gap: "2px",
  },

  "& .MuiPaginationItem-root": {
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    color: "#6b7280",
    minWidth: "44px",
    height: "44px",
    fontSize: "16px",
    fontWeight: "500",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    "&.Mui-selected": {
      backgroundColor: "#010048",
      color: "#fff",
      borderColor: "#010048",
      "&:hover": {
        backgroundColor: "#010048",
      },
    },
  },

  "& .MuiPaginationItem-previousNext": {
    color: "#010048",
    borderColor: "#e5e7eb",
    fontWeight: "500",
  }
}));

export default function CustomPagination({
  page,
  totalPages,
  onChange,
}) {
  return (
    <div className="flex justify-center mt-6">
      <StyledPagination
        page={page}
        boundaryCount={2} 
        siblingCount={0}
        count={totalPages}
        onChange={(e, value) => onChange(value)}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            slots={{
              previous: () => <span>Prev</span>,
              next: () => <span>Next</span>,
            }}
          />
        )}
      />
    </div>
  );
}
