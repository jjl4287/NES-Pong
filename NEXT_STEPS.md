# NES Pong Project: Next Steps

## What's Been Accomplished

1. **Infrastructure Setup**
   - Created a Google Cloud Storage bucket (`nes.jakoblangtry.com`) for hosting
   - Configured the bucket for static website hosting
   - Set public access permissions for website content

2. **Local Development Environment**
   - Set up Node.js with pnpm package management
   - Created a build script that:
     - Compiles the 6502 assembly code using NESASM
     - Handles the jsNES emulator setup
     - Generates a complete website structure

3. **Continuous Deployment**
   - Prepared a Cloud Build configuration file
   - Created deployment scripts for manual deployment

4. **Assets & Code Structure**
   - Organized assembly code in `src/asm`
   - Prepared web assets in `public` directory
   - Set up basic `.gitignore` and project metadata

## What Needs to Be Addressed

1. **Sprites File**
   - Need to provide a valid `sprites.chr` file
   - See [SPRITES_NOTE.md](SPRITES_NOTE.md) for details

2. **Cloud Build Trigger**
   - Set up the Cloud Build trigger through the Google Cloud Console
   - Follow these steps:
     1. Navigate to Cloud Build → Triggers in the GCP Console
     2. Click "Create Trigger"
     3. Configure it to use your GitHub repository and the `cloudbuild.yaml` file
     4. Set it to trigger on pushes to the main branch

3. **DNS Configuration**
   - Configure your domain's DNS settings to point to the GCS bucket
   - Follow the instructions in [dns-setup.md](dns-setup.md)

## Optional Enhancements

1. **Audio Support**
   - The current jsNES implementation doesn't include audio
   - This could be added by implementing the audio sample callback

2. **ROM Versioning**
   - Consider adding ROM version tracking in the filename or metadata
   - Example: `pong-v1.0.0.nes`, `pong-v1.0.1.nes`, etc.

3. **Mobile Controls**
   - Add touch-based controls for mobile devices
   - Consider using virtual D-pad or swipe gestures

4. **Game Selection**
   - If you have multiple ROMs (like both single and two-player versions)
   - Create a game selection interface

## Maintaining the Project

1. **Dependency Updates**
   - Periodically update Node.js dependencies with `pnpm update`
   - Keep jsNES updated to benefit from emulator improvements

2. **Backup Strategy**
   - Regularly back up your sprites.chr and compiled ROM files
   - Store them in version control or a separate backup location

3. **Monitoring**
   - Consider adding basic analytics to track usage
   - Set up monitoring alerts for website availability

## Getting Help

If you encounter issues with:

1. **Assembly Compilation**
   - Visit the [NESDev Forums](https://forums.nesdev.org/)
   - Check NESASM documentation at [NESASM GitHub](https://github.com/camsaul/nesasm)

2. **jsNES Emulator**
   - Refer to the [jsNES GitHub repository](https://github.com/bfirsh/jsnes)
   - Check browser console for JavaScript errors

3. **Google Cloud**
   - Consult the [Google Cloud Storage documentation](https://cloud.google.com/storage/docs)
   - Use the `gcloud` CLI tool for troubleshooting 