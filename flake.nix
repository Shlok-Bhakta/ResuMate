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
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
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
            unstable.gemini-cli
          ];
          
          shellHook = ''
          '';
        };
      });
}
