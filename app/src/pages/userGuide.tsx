import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Link,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import userGuideSections, { type GuideSection } from '../content/userGuideContent';

function matchesSearch(section: GuideSection, query: string): boolean {
  const q = query.toLowerCase();
  if (section.title.toLowerCase().includes(q)) return true;
  if (section.summary.toLowerCase().includes(q)) return true;
  if (section.keywords.some((k) => k.toLowerCase().includes(q))) return true;
  if (section.steps.some((s) => s.text.toLowerCase().includes(q))) return true;
  return false;
}

function GuideSectionCard({ section }: { section: GuideSection }) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }} id={section.id} role="region" aria-labelledby={`h-${section.id}`}>
      <Typography variant="h5" component="h2" id={`h-${section.id}`} sx={{ fontWeight: 600 }}>
        {section.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
        {section.summary}
      </Typography>
      {section.keywords.length > 0 && (
        <Stack direction="row" sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }} aria-label="Keywords">
          {section.keywords.map((kw) => (
            <Chip key={kw} label={kw} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
      <Box component="ol" sx={{ pl: 0, listStyle: 'none' }}>
        {section.steps.map((step) => (
          <Box component="li" key={step.number} sx={{ mb: 1.5 }}>
            <Typography variant="body1">
              <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
                {step.number}.
              </Box>
              {step.text}
            </Typography>
            {step.callouts?.map((c, i) => (
              <Alert key={i} severity={c.type as 'info' | 'warning' | 'error' | 'success'} sx={{ mt: 1 }}>
                {c.message}
              </Alert>
            ))}
          </Box>
        ))}
      </Box>
      {section.warnings?.map((w, i) => (
        <Alert key={i} severity="warning" sx={{ mt: 1 }}>
          {w}
        </Alert>
      ))}
      {section.links && section.links.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
          {section.links.map((l) => (
            <Link key={l.to} href={l.to} underline="hover" sx={{ cursor: 'pointer' }}>
              {l.label}
            </Link>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default function UserGuidePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);

  const filtered = searchQuery.trim()
    ? userGuideSections.filter((s) => matchesSearch(s, searchQuery))
    : userGuideSections;

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.focus({ preventScroll: true });
    }
  };

  const resultCount = filtered.length;

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 2, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Help & User Guide
        </Typography>

        <TextField
          inputRef={searchRef}
          fullWidth
          size="small"
          placeholder="Search guide sections, keywords, or steps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search the user guide"
          aria-controls="guide-results"
          aria-describedby="search-description"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Typography id="search-description" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {searchQuery.trim()
            ? `${resultCount} section${resultCount === 1 ? '' : 's'} match${resultCount === 1 ? 'es' : ''} "${searchQuery}"`
            : `Browse ${userGuideSections.length} sections`}
        </Typography>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }} role="navigation" aria-label="Table of contents">
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            On this page
          </Typography>
          <Stack component="ul" sx={{ pl: 2, m: 0 }} spacing={0.5}>
            {filtered.map((s) => (
              <Box component="li" key={s.id}>
                <Link
                  href={`#${s.id}`}
                  onClick={(e) => handleTocClick(e, s.id)}
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                >
                  {s.title}
                </Link>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        <Box id="guide-results" role="region" aria-live="polite" aria-label="Guide content">
          {resultCount === 0 ? (
            <Alert severity="info">
              No sections match &quot;{searchQuery}&quot;. Try a different search term or{' '}
              <Link
                href="#"
                onClick={(e) => { e.preventDefault(); setSearchQuery(''); searchRef.current?.focus(); }}
                underline="hover"
                sx={{ cursor: 'pointer' }}
              >
                clear the search
              </Link>
              .
            </Alert>
          ) : (
            filtered.map((section) => (
              <GuideSectionCard key={section.id} section={section} />
            ))
          )}
        </Box>
      </Box>
    </PageContainer>
  );
}
