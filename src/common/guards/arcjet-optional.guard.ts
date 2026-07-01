import type { ArcjetNest } from "@arcjet/nest";
import { ARCJET, ArcjetGuard } from "@arcjet/nest";
import {
  type ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const SKIP_ARCJET = "skip_arcjet";
export const SkipArcjet = () => SetMetadata(SKIP_ARCJET, true);

@Injectable()
export class ArcjetOptionalGuard extends ArcjetGuard {
  constructor(
    @Inject(ARCJET) aj: ArcjetNest,
    private readonly reflector: Reflector,
  ) {
    super(aj);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipArcjet = this.reflector.getAllAndOverride<boolean>(SKIP_ARCJET, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipArcjet) {
      return true;
    }

    return super.canActivate(context);
  }
}
