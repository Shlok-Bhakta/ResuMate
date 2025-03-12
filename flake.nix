{
  description = "Resume ATS Optimization Application";

  nixConfig = {
    extra-substituters = [
      "https://cuda-maintainers.cachix.org"
    ];
    extra-trusted-public-keys = [
      "cuda-maintainers.cachix.org-1:0dq3bujKpuEPMCX6U4WylrUDZ9JyUG0VpVZa7CNfq5E="
    ];
  };


  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    unstable-nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, unstable-nixpkgs}:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = { allowUnfree = true; };
        };
        unstable = import unstable-nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "Resume-ATS-Optimizer";
          nativeBuildInputs = with pkgs; [
            python311
            python311Packages.nltk
            python311Packages.pandas
            python311Packages.numpy
            python311Packages.matplotlib
            python311Packages.scikitlearn
            python311Packages.scipy
            python311Packages.spacy
            python311Packages.beautifulsoup4
            python311Packages.alive-progress
            python311Packages.tensorflow
            python311Packages.fuzzywuzzy
            python311Packages.sentence-transformers
            python311Packages.tqdm
            python311Packages.joblib
            python311Packages.keras
            python311Packages.tf-keras
            python311Packages.openai
          ];
          
          shellHook = ''
            echo "Resume ATS Optimization environment ready."
            zsh
          '';
        };
      });
}
