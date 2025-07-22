{
  description = "Automerge Repo";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        dev = pkgs.writeShellApplication {
          name = "dev";
          runtimeInputs = [
            pkgs.nodejs_24
            pkgs.pnpm
          ];
          text = ''
            pnpm i --silent
            pnpm dev
          '';
        };

        react_todo_example = pkgs.writeShellApplication {
          name = "react_todo_example";
          runtimeInputs = [
            pkgs.nodejs_24
            pkgs.pnpm
          ];
          text = ''
            cd ./examples/react-todo
            pnpm i --silent
            pnpm dev
          '';
        };

      in
        {
          devShell = pkgs.mkShell {
            name = "Automerge Repo Dev Shell";
            formatter = pkgs.alejandra;

            nativeBuildInputs = [
              pkgs.nodejs_24
              pkgs.pnpm
            ];
          };

          packages.default = dev;

          apps.dev = {
            type = "app";
            program = "${dev}/bin/dev";
          };

          apps.react_todo_example = {
            type = "app";
            program = "${react_todo_example}/bin/react_todo_example";
          };
        }
    );
}
