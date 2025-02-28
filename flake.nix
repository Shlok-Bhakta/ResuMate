{
  description = "Resume ATS Optimization Application";

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
          ] ++ [
            unstable.bun
          ];
          
          shellHook = ''
            echo "Resume ATS Optimization environment ready."
            zsh
          '';
        };
      });
}