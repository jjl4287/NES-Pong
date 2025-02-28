# DNS Configuration for nes.jakoblangtry.com

To set up your custom domain to point to your Google Cloud Storage bucket, you need to configure your DNS settings. Follow these steps:

## Step 1: Verify Domain Ownership (if not already done)

1. Go to the [Google Search Console](https://search.google.com/search-console)
2. Add your domain if it's not already verified
3. Follow the verification instructions, which typically involve adding a TXT record to your DNS

## Step 2: Configure DNS Records

Add the following CNAME record to your DNS settings:

```
Name: nes
Type: CNAME
Value: c.storage.googleapis.com.
TTL: 3600 (or as recommended by your DNS provider)
```

Alternatively, if your DNS provider doesn't support CNAME records at the apex domain, you can use an A record with Google's special IP addresses:

```
Name: nes
Type: A
Value: 199.36.158.100
TTL: 3600
```

## Step 3: Verify DNS Configuration

After adding the DNS records, you can verify they're correctly set up using the dig command:

```bash
dig CNAME nes.jakoblangtry.com
```

Or for A records:

```bash
dig A nes.jakoblangtry.com
```

## Step 4: Wait for DNS Propagation

DNS changes can take up to 48 hours to fully propagate throughout the internet, though they often complete much sooner. Be patient if your site isn't immediately accessible.

## Step 5: Test Your Website

Once DNS propagation is complete, visit https://nes.jakoblangtry.com to verify that your NES Pong game is accessible.

## Troubleshooting

- If you encounter a 404 error, ensure that your bucket name exactly matches your domain name (nes.jakoblangtry.com)
- If you see a 403 error, check that your bucket permissions are correctly set to allow public read access
- For SSL issues, make sure you're using the HTTPS URL and that Google's managed SSL certificate has been properly provisioned

For more detailed instructions, refer to the [Google Cloud Storage documentation on hosting static websites](https://cloud.google.com/storage/docs/hosting-static-website). 