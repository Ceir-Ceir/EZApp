import subprocess
import sys
import pkg_resources
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        sys.exit(1)
    logger.info(f"Python version {sys.version_info.major}.{sys.version_info.minor} is compatible")

def install_dependencies():
    """Install dependencies from requirements.txt"""
    try:
        # Upgrade pip first
        logger.info("Upgrading pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        
        # Install requirements
        logger.info("Installing dependencies from requirements.txt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        # Install Playwright browsers
        logger.info("Installing Playwright browsers...")
        subprocess.check_call([sys.executable, "-m", "playwright", "install"])
        
        logger.info("All dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error installing dependencies: {e}")
        sys.exit(1)

def verify_installations():
    """Verify that all required packages are installed"""
    required_packages = {
        'openai': '1.0.0',
        'playwright': '1.40.0',
        'firebase-admin': '6.0.0',
        'python-dotenv': '0.19.0',
        'reportlab': '4.0.0',
        'google-cloud-storage': '2.0.0',
        'google-cloud-firestore': '2.0.0',
        'google-auth': '2.0.0'
    }
    
    missing_packages = []
    for package, min_version in required_packages.items():
        try:
            installed_version = pkg_resources.get_distribution(package).version
            if pkg_resources.parse_version(installed_version) < pkg_resources.parse_version(min_version):
                missing_packages.append(f"{package} (installed: {installed_version}, required: {min_version})")
        except pkg_resources.DistributionNotFound:
            missing_packages.append(f"{package} (not installed)")
    
    if missing_packages:
        logger.error("Missing or outdated packages:")
        for package in missing_packages:
            logger.error(f"  - {package}")
        return False
    
    logger.info("All required packages are installed and up to date")
    return True

def main():
    """Main function to run the installation process"""
    logger.info("Starting dependency installation process...")
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_dependencies()
    
    # Verify installations
    if not verify_installations():
        logger.error("Dependency verification failed")
        sys.exit(1)
    
    logger.info("Installation process completed successfully")

if __name__ == "__main__":
    main() 