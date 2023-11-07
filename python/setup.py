import os
from setuptools import find_packages, setup

with open("fullcount/version.txt") as ifp:
    VERSION = ifp.read().strip()

long_description = ""
with open("README.md") as ifp:
    long_description = ifp.read()

os.environ["BROWNIE_LIB"] = "1"

setup(
    name="fullcount",
    version=VERSION,
    packages=find_packages(),
    install_requires=["eth-brownie"],
    extras_require={
        "dev": ["black", "moonworm[moonstream]"],
        "distribute": ["setuptools", "twine", "wheel"],
    },
    description="Fullcount.xyz Python client and game design utilities",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Moonstream",
    author_email="engineering@moonstream.to",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Programming Language :: Python",
        "License :: OSI Approved :: Apache Software License",
        "Topic :: Software Development :: Libraries",
    ],
    python_requires=">=3.6",
    entry_points={"console_scripts": ["fullcount=fullcount.cli:main"]},
    include_package_data=True,
)
