import { Backdrop, CircularProgress } from '@mui/material';

export const LoadingSpinner = ({ open }) => (
  <Backdrop open={open} sx={{ zIndex: 9999 }}>
    <CircularProgress />
  </Backdrop>
); 