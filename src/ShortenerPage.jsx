import { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Paper, Alert } from '@mui/material';
import logger from './logger';

const defaultUrlObj = { url: '', validity: '', shortcode: '', error: '' };

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function generateShortcode() {
  return Math.random().toString(36).substring(2, 8);
}

export default function ShortenerPage() {
  const [urls, setUrls] = useState([
    { ...defaultUrlObj },
  ]);
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (idx, field, value) => {
    const newUrls = urls.map((u, i) => i === idx ? { ...u, [field]: value, error: '' } : u);
    setUrls(newUrls);
  };

  const addUrlField = () => {
    if (urls.length < 5) setUrls([...urls, { ...defaultUrlObj }]);
  };

  const removeUrlField = (idx) => {
    setUrls(urls.filter((_, i) => i !== idx));
  };

  const validate = () => {
    let valid = true;
    const newUrls = urls.map((u) => {
      let error = '';
      if (!u.url) error = 'URL required';
      else if (!isValidUrl(u.url)) error = 'Invalid URL';
      else if (u.validity && (!/^[0-9]+$/.test(u.validity) || parseInt(u.validity) <= 0)) error = 'Validity must be a positive integer';
      else if (u.shortcode && !/^[a-zA-Z0-9]{4,}$/.test(u.shortcode)) error = 'Shortcode must be alphanumeric and at least 4 chars';
      if (error) valid = false;
      return { ...u, error };
    });
    setUrls(newUrls);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      logger.log('error', 'Validation failed', urls);
      return;
    }
    setSubmitting(true);
    // Simulate shortening
    const newResults = urls.map((u) => {
      let code = u.shortcode || generateShortcode();
      let expiry = u.validity ? new Date(Date.now() + parseInt(u.validity) * 60000) : new Date(Date.now() + 30 * 60000);
      return {
        original: u.url,
        short: window.location.origin + '/' + code,
        expiry: expiry.toLocaleString(),
        shortcode: code,
      };
    });
    setResults(newResults);
    logger.log('info', 'URLs shortened', newResults);
    setSubmitting(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Shorten URLs</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {urls.map((u, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper sx={{ p: 2, mb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField label="Long URL" fullWidth value={u.url} onChange={e => handleChange(idx, 'url', e.target.value)} error={!!u.error} helperText={u.error} required />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField label="Validity (min)" fullWidth value={u.validity} onChange={e => handleChange(idx, 'validity', e.target.value)} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="Preferred Shortcode" fullWidth value={u.shortcode} onChange={e => handleChange(idx, 'shortcode', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    {urls.length > 1 && <Button color="error" onClick={() => removeUrlField(idx)}>Remove</Button>}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={addUrlField} disabled={urls.length >= 5}>Add URL</Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting}>Shorten</Button>
        </Box>
      </form>
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Shortened URLs</Typography>
          {results.map((r, i) => (
            <Alert key={i} severity="success" sx={{ mb: 1 }}>
              <strong>{r.short}</strong> (expires: {r.expiry})<br />
              Original: {r.original}
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );
} 