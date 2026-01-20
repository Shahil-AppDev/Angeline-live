import fs from 'fs';
import path from 'path';

export interface OracleManifest {
  id: string;
  name: string;
  description: string;
  cardsPath: string;
  energiesPath: string;
  phraseTemplatesPath: string;
  backsPath: string;
  extensions?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ManifestValidator {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Valide un manifest d'oracle
   */
  validateManifest(manifest: OracleManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier les champs obligatoires
    if (!manifest.id) {
      errors.push('Missing required field: id');
    }
    if (!manifest.name) {
      errors.push('Missing required field: name');
    }
    if (!manifest.cardsPath) {
      errors.push('Missing required field: cardsPath');
    }
    if (!manifest.energiesPath) {
      errors.push('Missing required field: energiesPath');
    }
    if (!manifest.phraseTemplatesPath) {
      errors.push('Missing required field: phraseTemplatesPath');
    }

    // Vérifier l'existence des fichiers
    if (manifest.cardsPath) {
      const cardsFullPath = path.join(this.basePath, manifest.cardsPath);
      if (!fs.existsSync(cardsFullPath)) {
        errors.push(`Cards file not found: ${manifest.cardsPath}`);
      } else {
        // Vérifier que le fichier contient au moins une carte
        try {
          const cardsData = JSON.parse(fs.readFileSync(cardsFullPath, 'utf-8'));
          if (!Array.isArray(cardsData) || cardsData.length === 0) {
            errors.push(`Cards file must contain at least one card: ${manifest.cardsPath}`);
          }
        } catch (error) {
          errors.push(`Invalid JSON in cards file: ${manifest.cardsPath}`);
        }
      }
    }

    if (manifest.energiesPath) {
      const energiesFullPath = path.join(this.basePath, manifest.energiesPath);
      if (!fs.existsSync(energiesFullPath)) {
        errors.push(`Energies file not found: ${manifest.energiesPath}`);
      }
    }

    if (manifest.phraseTemplatesPath) {
      const templatesFullPath = path.join(this.basePath, manifest.phraseTemplatesPath);
      if (!fs.existsSync(templatesFullPath)) {
        errors.push(`Phrase templates file not found: ${manifest.phraseTemplatesPath}`);
      }
    }

    if (manifest.backsPath) {
      const backsFullPath = path.join(this.basePath, manifest.backsPath);
      if (!fs.existsSync(backsFullPath)) {
        warnings.push(`Backs path not found: ${manifest.backsPath}`);
      }
    }

    // Vérifications spécifiques pour ORACLE_MYSTICA
    if (manifest.id === 'ORACLE_MYSTICA') {
      if (!manifest.extensions || manifest.extensions.length === 0) {
        warnings.push('ORACLE_MYSTICA should have extensions defined');
      } else {
        const requiredExtensions = ['SENTIMENTAL', 'TRAVAIL'];
        for (const ext of requiredExtensions) {
          if (!manifest.extensions.includes(ext)) {
            warnings.push(`ORACLE_MYSTICA missing recommended extension: ${ext}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valide tous les oracles dans un dossier
   */
  validateAllOracles(oraclesConfigPath: string): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();

    try {
      const config = JSON.parse(fs.readFileSync(oraclesConfigPath, 'utf-8'));
      
      if (!config.oracles || !Array.isArray(config.oracles)) {
        console.error('Invalid oracles config: missing oracles array');
        return results;
      }

      for (const oracle of config.oracles) {
        const result = this.validateManifest(oracle);
        results.set(oracle.id || 'unknown', result);
      }
    } catch (error) {
      console.error('Error reading oracles config:', error);
    }

    return results;
  }

  /**
   * Affiche un rapport de validation
   */
  printValidationReport(results: Map<string, ValidationResult>): void {
    console.log('\n=== Oracle Manifest Validation Report ===\n');

    let totalValid = 0;
    let totalInvalid = 0;

    for (const [oracleId, result] of results.entries()) {
      if (result.valid) {
        totalValid++;
        console.log(`✅ ${oracleId}: VALID`);
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            console.log(`   ⚠️  ${warning}`);
          });
        }
      } else {
        totalInvalid++;
        console.log(`❌ ${oracleId}: INVALID`);
        result.errors.forEach(error => {
          console.log(`   ❌ ${error}`);
        });
        result.warnings.forEach(warning => {
          console.log(`   ⚠️  ${warning}`);
        });
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total oracles: ${results.size}`);
    console.log(`Valid: ${totalValid}`);
    console.log(`Invalid: ${totalInvalid}`);
    console.log('==================\n');
  }

  /**
   * Valide et lance une exception si invalide
   */
  validateOrThrow(oraclesConfigPath: string): void {
    const results = this.validateAllOracles(oraclesConfigPath);
    this.printValidationReport(results);

    const hasInvalid = Array.from(results.values()).some(r => !r.valid);
    if (hasInvalid) {
      throw new Error('Oracle manifest validation failed. Please fix the errors above.');
    }
  }
}
