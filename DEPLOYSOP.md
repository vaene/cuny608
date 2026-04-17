# Story4.2 Deployment SOP

This is the deployment flow for the Story 4 Next.js deck published at `https://cuny.drinkthesand.com/608/Story4.2/`.

## Source Location

- Project root: `/Users/randyhowk/Documents/CUNY/CUNY608/Story4old/chartjs-nextjs`
- Static asset prefix in S3: `608/Story4.2/`
- S3 bucket: `cuny-drinkthesand-story4`
- CloudFront distribution: `E3RL8SG2LQBKGE`

## Build And Publish

1. Open a terminal in the project directory.
2. Install dependencies if needed:

```bash
npm install
```

3. Build the static export:

```bash
npm run build
```

4. Sync the exported site to S3:

```bash
aws s3 sync out s3://cuny-drinkthesand-story4/608/Story4.2/ --delete
```

5. Re-upload the local bundle zip so the final slide download stays available:

```bash
aws s3 cp /tmp/Story4.2-local-bundle.zip s3://cuny-drinkthesand-story4/608/Story4.2/Story4.2-local-bundle.zip
```

6. Invalidate CloudFront so the new files are served immediately:

```bash
aws cloudfront create-invalidation --distribution-id E3RL8SG2LQBKGE --paths '/608/Story4.2' '/608/Story4.2/*' '/608/Story4.2/Story4.2-local-bundle.zip'
```

## Verification

Check these URLs after deployment:

- `https://cuny.drinkthesand.com/608/Story4.2`
- `https://cuny.drinkthesand.com/608/Story4.2/`
- `https://cuny.drinkthesand.com/608/Story4.2/sources/`
- `https://cuny.drinkthesand.com/608/Story4.2/Story4.2-local-bundle.zip`

If a page reports a 404 for JSON data, confirm the app is using the Story4.2 base path and rerun the build and sync.

## Notes

- The Next.js app uses `output: "export"` and `trailingSlash: true`.
- `loadJSON()` resolves `/data/...` to `/608/Story4.2/data/...`.
- The final slide includes a link to the packaged local zip for offline/local use.
