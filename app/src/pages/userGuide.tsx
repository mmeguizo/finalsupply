import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import userGuideSections, { type GuideSection } from '../content/userGuideContent';

function GuideSectionCard({ section }: { section: GuideSection }) {
  return (
    <Paper sx={{ p: 3, mb: 3 }} id={section.id}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        {section.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {section.summary}
      </Typography>
      {section.keywords.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          {section.keywords.map((kw) => (
            <Chip key={kw} label={kw} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
      {section.steps.map((step) => (
        <Box key={step.number} sx={{ mb: 1.5 }}>
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
      {section.warnings?.map((w, i) => (
        <Alert key={i} severity="warning" sx={{ mt: 1 }}>
          {w}
        </Alert>
      ))}
    </Paper>
  );
}

export default function UserGuidePage() {
  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 2, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Help & User Guide
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          This guide explains how to use the supply management system step by step. Select a section below or scroll to read through.
        </Typography>
        {userGuideSections.map((section) => (
          <GuideSectionCard key={section.id} section={section} />
        ))}
      </Box>
    </PageContainer>
  );
}
